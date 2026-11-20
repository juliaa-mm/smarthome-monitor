const { query } = require('./db');
const { runScenario } = require('./routes/operations');

async function checkTimeScenarios() {
  const due = await query(`
    SELECT s.scenario_id, s.name
    FROM automation_scenarios s
    CROSS JOIN LATERAL regexp_match(s.trigger_condition, '^\\s*[Чч]ас\\s+(\\d{1,2})[:.](\\d{2})\\s*$') AS m
    WHERE s.is_active = 1
      AND s.device_id IS NOT NULL
      AND m[1]::int = EXTRACT(HOUR FROM LOCALTIMESTAMP)
      AND m[2]::int = EXTRACT(MINUTE FROM LOCALTIMESTAMP)
      AND NOT EXISTS (
        SELECT 1 FROM events e
        WHERE e.scenario_id = s.scenario_id
          AND e.event_time >= date_trunc('minute', LOCALTIMESTAMP)
      )`);

  for (const sc of due) {
    try {
      const r = await runScenario(sc.scenario_id, true);
      console.log(`Сценарій «${sc.name}» спрацював автоматично: ${r.old_state} → ${r.new_state}`);
    } catch (e) {
      console.error(`Сценарій «${sc.name}» не виконано: ${e.message}`);
    }
  }
}

function startScheduler() {
  const tick = () => checkTimeScenarios().catch((e) => console.error('Планувальник:', e.message));
  tick();
  setInterval(tick, 20 * 1000);
}

module.exports = { startScheduler };
