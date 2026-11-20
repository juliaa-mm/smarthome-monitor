const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totals, byState, byType, byRoom, latest, problems, recent, byDay] = await Promise.all([
    query(`SELECT (SELECT COUNT(*)::int FROM houses)  AS houses,
                  (SELECT COUNT(*)::int FROM rooms)   AS rooms,
                  (SELECT COUNT(*)::int FROM devices) AS devices,
                  (SELECT COUNT(*)::int FROM devices WHERE current_state = 'ON') AS devices_on,
                  (SELECT COUNT(*)::int FROM devices
                    WHERE current_state IN ('ERROR', 'OFFLINE')) AS devices_problem,
                  (SELECT COUNT(*)::int FROM automation_scenarios WHERE is_active = 1) AS scenarios_active,
                  (SELECT COUNT(*)::int FROM events) AS events`),
    query(`SELECT current_state AS label, COUNT(*)::int AS value
           FROM devices GROUP BY current_state ORDER BY value DESC`),
    query(`SELECT dt.name AS label, COUNT(d.device_id)::int AS value
           FROM device_types dt LEFT JOIN devices d ON d.type_id = dt.type_id
           GROUP BY dt.name ORDER BY value DESC, dt.name`),
    query(`SELECT r.name || ' (' || h.name || ')' AS label, COUNT(e.event_id)::int AS value
           FROM rooms r
           JOIN houses h ON h.house_id = r.house_id
           LEFT JOIN devices d ON d.room_id = r.room_id
           LEFT JOIN events e ON e.device_id = d.device_id
           GROUP BY r.room_id, r.name, h.name
           ORDER BY value DESC, label`),
    query('SELECT * FROM v_latest_readings ORDER BY reading_time DESC LIMIT 8'),
    query(`SELECT * FROM v_room_device_states
           WHERE current_state IN ('ERROR', 'OFFLINE') ORDER BY house_name, room_name`),
    query('SELECT * FROM v_events_full ORDER BY event_time DESC, event_id DESC LIMIT 6'),
    query(`SELECT TO_CHAR(event_time::date, 'DD.MM') AS label, COUNT(*)::int AS value
           FROM events GROUP BY event_time::date ORDER BY event_time::date`),
  ]);
  res.json({
    totals: totals[0], byState, byType, byRoom, latest, problems, recent, byDay,
  });
}));

router.get('/readings-series', asyncHandler(async (req, res) => {
  const ids = String(req.query.dp || '')
    .split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return res.json([]);
  const rows = await query(
    `SELECT sr.device_parameter_id, d.name AS device_name, p.name AS parameter_name, p.unit,
            sr.value, sr.reading_time
     FROM sensor_readings sr
     JOIN device_parameters dp ON dp.device_parameter_id = sr.device_parameter_id
     JOIN devices d ON d.device_id = dp.device_id
     JOIN parameters p ON p.parameter_id = dp.parameter_id
     WHERE sr.device_parameter_id = ANY($1::int[])
     ORDER BY sr.reading_time`,
    [ids]
  );
  res.json(rows);
}));

router.get('/room-states', asyncHandler(async (req, res) => {
  res.json(await query('SELECT * FROM v_room_device_states ORDER BY house_name, room_name, device_name'));
}));

router.get('/room-summary', asyncHandler(async (req, res) => {
  res.json(await query(`
    SELECT house_name, room_name,
           COUNT(*)::int AS devices_total,
           SUM(CASE WHEN current_state = 'ON'  THEN 1 ELSE 0 END)::int AS on_count,
           SUM(CASE WHEN current_state = 'OFF' THEN 1 ELSE 0 END)::int AS off_count,
           SUM(CASE WHEN current_state IN ('ERROR', 'OFFLINE') THEN 1 ELSE 0 END)::int AS problem_count
    FROM v_room_device_states
    GROUP BY house_name, room_name
    ORDER BY house_name, room_name`));
}));

router.get('/top-devices', asyncHandler(async (req, res) => {
  res.json(await query(`
    SELECT d.device_id, d.name AS device_name, r.name AS room_name, h.name AS house_name,
           COUNT(e.event_id)::int AS events_count,
           RANK() OVER (ORDER BY COUNT(e.event_id) DESC)::int AS place
    FROM devices d
    JOIN rooms r  ON r.room_id  = d.room_id
    JOIN houses h ON h.house_id = r.house_id
    LEFT JOIN events e ON e.device_id = d.device_id
    GROUP BY d.device_id, d.name, r.name, h.name
    ORDER BY events_count DESC, d.name`));
}));

router.get('/scenario-rooms', asyncHandler(async (req, res) => {
  res.json(await query(`
    SELECT h.name AS house_name, r.name AS room_name,
           COUNT(e.event_id)::int AS scenario_events,
           COUNT(DISTINCT e.scenario_id)::int AS scenarios_count,
           MIN(e.event_time) AS first_run,
           MAX(e.event_time) AS last_run
    FROM events e
    JOIN devices d ON d.device_id = e.device_id
    JOIN rooms r   ON r.room_id   = d.room_id
    JOIN houses h  ON h.house_id  = r.house_id
    WHERE e.scenario_id IS NOT NULL
    GROUP BY h.name, r.room_id, r.name
    ORDER BY scenario_events DESC, h.name, r.name`));
}));

router.get('/latest-readings', asyncHandler(async (req, res) => {
  res.json(await query('SELECT * FROM v_latest_readings ORDER BY house_name, device_name, parameter_name'));
}));

router.get('/table-counts', asyncHandler(async (req, res) => {
  res.json(await query(`
    SELECT 'houses' AS table_name, COUNT(*)::int AS rows_count FROM houses
    UNION ALL SELECT 'rooms', COUNT(*)::int FROM rooms
    UNION ALL SELECT 'device_types', COUNT(*)::int FROM device_types
    UNION ALL SELECT 'devices', COUNT(*)::int FROM devices
    UNION ALL SELECT 'parameters', COUNT(*)::int FROM parameters
    UNION ALL SELECT 'device_parameters', COUNT(*)::int FROM device_parameters
    UNION ALL SELECT 'sensor_readings', COUNT(*)::int FROM sensor_readings
    UNION ALL SELECT 'event_types', COUNT(*)::int FROM event_types
    UNION ALL SELECT 'events', COUNT(*)::int FROM events
    UNION ALL SELECT 'state_history', COUNT(*)::int FROM state_history
    UNION ALL SELECT 'automation_scenarios', COUNT(*)::int FROM automation_scenarios
    UNION ALL SELECT 'app_users', COUNT(*)::int FROM app_users`));
}));

module.exports = router;
