const express = require('express');
const { query, withTransaction } = require('../db');
const { adminOnly } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errors');
const { KeyedMutex } = require('../utils/mutex');
const { STATES } = require('./entities');

const router = express.Router();
const deviceMutex = new KeyedMutex();

const EVENT_BY_STATE = {
  ON: 'Увімкнення',
  OFF: 'Вимкнення',
  ERROR: 'Помилка пристрою',
  OFFLINE: 'Втрата підключення',
};

function targetStateFromAction(action) {
  const a = action.toLowerCase();
  if (a.includes('вимкн')) return 'OFF';
  if (a.includes('увімкн') || a.includes('вмикн')) return 'ON';
  return null;
}

async function applyDeviceState(client, deviceId, newState, description, scenarioId = null) {
  const dev = await client.query(
    'SELECT device_id, name, current_state FROM devices WHERE device_id = $1 FOR UPDATE NOWAIT',
    [deviceId]
  );
  if (!dev.rows.length) throw new HttpError(404, 'Пристрій не знайдено');
  const oldState = dev.rows[0].current_state;

  const et = await client.query('SELECT event_type_id FROM event_types WHERE name = $1', [
    EVENT_BY_STATE[newState],
  ]);
  if (!et.rows.length) throw new HttpError(500, `Не знайдено тип події «${EVENT_BY_STATE[newState]}»`);

  let historyId = null;
  if (oldState !== newState) {
    await client.query('UPDATE devices SET current_state = $1 WHERE device_id = $2', [newState, deviceId]);
    const h = await client.query(
      `INSERT INTO state_history (device_id, old_state, new_state)
       VALUES ($1, $2, $3) RETURNING history_id`,
      [deviceId, oldState, newState]
    );
    historyId = h.rows[0].history_id;
  }

  const ev = await client.query(
    `INSERT INTO events (device_id, event_type_id, description, scenario_id)
     VALUES ($1, $2, $3, $4) RETURNING event_id, event_time`,
    [deviceId, et.rows[0].event_type_id, description, scenarioId]
  );

  return {
    device_id: deviceId,
    device_name: dev.rows[0].name,
    old_state: oldState,
    new_state: newState,
    changed: oldState !== newState,
    history_id: historyId,
    event_id: ev.rows[0].event_id,
    event_time: ev.rows[0].event_time,
  };
}

router.post('/devices/:id/state', adminOnly, asyncHandler(async (req, res) => {
  const deviceId = Number(req.params.id);
  const newState = req.body.new_state;
  if (!STATES.includes(newState)) throw new HttpError(400, 'Недопустимий стан пристрою');

  const result = await deviceMutex.runExclusive(deviceId, () =>
    withTransaction(async (client) => {
      const r = await applyDeviceState(client, deviceId, newState,
        req.body.description || `Стан змінено вручну користувачем ${req.user.login}`);
      if (!r.changed) throw new HttpError(409, `Пристрій уже перебуває у стані ${newState}`);
      return r;
    })
  );
  res.json(result);
}));

async function runScenario(scenarioId, auto = false) {
  const pre = await query('SELECT device_id FROM automation_scenarios WHERE scenario_id = $1', [scenarioId]);
  if (!pre.length) throw new HttpError(404, 'Сценарій не знайдено');
  const lockKey = pre[0].device_id ?? `scenario-${scenarioId}`;

  return deviceMutex.runExclusive(lockKey, () =>
    withTransaction(async (client) => {
      const s = await client.query(
        'SELECT * FROM automation_scenarios WHERE scenario_id = $1 FOR SHARE',
        [scenarioId]
      );
      if (!s.rows.length) throw new HttpError(404, 'Сценарій не знайдено');
      const sc = s.rows[0];
      if (sc.is_active !== 1) throw new HttpError(409, 'Сценарій неактивний — його не можна виконати');
      if (!sc.device_id) {
        throw new HttpError(409, 'Сценарій не прив\'язаний до пристрою, тому не змінює його стан');
      }
      const target = targetStateFromAction(sc.action_description);
      if (!target) throw new HttpError(409, 'Дія сценарію не змінює стан пристрою');

      const how = auto ? `автоматично за умовою «${sc.trigger_condition}»` : 'вручну';
      const r = await applyDeviceState(
        client, sc.device_id, target,
        `${sc.action_description}: сценарій «${sc.name}» виконано ${how}`, sc.scenario_id
      );
      return { scenario_id: sc.scenario_id, scenario_name: sc.name, ...r };
    })
  );
}

router.post('/scenarios/:id/run', adminOnly, asyncHandler(async (req, res) => {
  res.json(await runScenario(Number(req.params.id)));
}));

module.exports = router;
module.exports.runScenario = runScenario;
