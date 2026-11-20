CREATE OR REPLACE VIEW v_room_device_states AS
SELECT h.house_id,
       h.name  AS house_name,
       r.room_id,
       r.name  AS room_name,
       r.floor,
       d.device_id,
       d.name  AS device_name,
       dt.name AS device_type,
       d.current_state,
       d.work_mode,
       sh.last_change
FROM devices d
JOIN rooms r         ON r.room_id  = d.room_id
JOIN houses h        ON h.house_id = r.house_id
JOIN device_types dt ON dt.type_id = d.type_id
LEFT JOIN (
    SELECT device_id, MAX(changed_at) AS last_change
    FROM state_history
    GROUP BY device_id
) sh ON sh.device_id = d.device_id;

CREATE OR REPLACE VIEW v_latest_readings AS
SELECT DISTINCT ON (sr.device_parameter_id)
       sr.device_parameter_id,
       d.device_id,
       d.name       AS device_name,
       r.name       AS room_name,
       h.name       AS house_name,
       p.parameter_id,
       p.name       AS parameter_name,
       p.unit,
       sr.value,
       sr.reading_time
FROM sensor_readings sr
JOIN device_parameters dp ON dp.device_parameter_id = sr.device_parameter_id
JOIN devices d            ON d.device_id  = dp.device_id
JOIN parameters p         ON p.parameter_id = dp.parameter_id
JOIN rooms r              ON r.room_id  = d.room_id
JOIN houses h             ON h.house_id = r.house_id
ORDER BY sr.device_parameter_id, sr.reading_time DESC;

CREATE OR REPLACE VIEW v_events_full AS
SELECT e.event_id,
       e.event_time,
       h.house_id,
       h.name  AS house_name,
       r.room_id,
       r.name  AS room_name,
       d.device_id,
       d.name  AS device_name,
       et.event_type_id,
       et.name AS event_type,
       e.description,
       e.scenario_id,
       s.name  AS scenario_name
FROM events e
JOIN devices d      ON d.device_id = e.device_id
JOIN rooms r        ON r.room_id   = d.room_id
JOIN houses h       ON h.house_id  = r.house_id
JOIN event_types et ON et.event_type_id = e.event_type_id
LEFT JOIN automation_scenarios s ON s.scenario_id = e.scenario_id;
