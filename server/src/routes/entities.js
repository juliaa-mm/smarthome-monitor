const STATES = ['ON', 'OFF', 'ERROR', 'OFFLINE'];

const entities = {
  houses: {
    table: 'houses',
    pk: 'house_id',
    fields: {
      name: { label: 'Назва', required: true, max: 100 },
      address: { label: 'Адреса', required: true, max: 200 },
      city: { label: 'Місто', required: true, max: 100 },
    },
    listSql: `
      SELECT h.*,
             (SELECT COUNT(*)::int FROM rooms r WHERE r.house_id = h.house_id) AS rooms_count,
             (SELECT COUNT(*)::int FROM devices d JOIN rooms r ON r.room_id = d.room_id
               WHERE r.house_id = h.house_id) AS devices_count
      FROM houses h`,
    filters: { city: 'city' },
    search: ['name', 'address', 'city'],
    orderBy: 'house_id',
  },

  rooms: {
    table: 'rooms',
    pk: 'room_id',
    fields: {
      house_id: { label: 'Будинок', required: true, type: 'int' },
      name: { label: 'Назва', required: true, max: 100 },
      floor: { label: 'Поверх', type: 'int', default: 1 },
    },
    listSql: `
      SELECT r.*, h.name AS house_name,
             (SELECT COUNT(*)::int FROM devices d WHERE d.room_id = r.room_id) AS devices_count
      FROM rooms r JOIN houses h ON h.house_id = r.house_id`,
    filters: { house_id: 'house_id' },
    search: ['name', 'house_name'],
    orderBy: 'house_id, room_id',
  },

  'device-types': {
    table: 'device_types',
    pk: 'type_id',
    fields: {
      name: { label: 'Назва', required: true, max: 100 },
      category: { label: 'Категорія', required: true, max: 100 },
      description: { label: 'Опис', max: 300 },
    },
    listSql: `
      SELECT dt.*, (SELECT COUNT(*)::int FROM devices d WHERE d.type_id = dt.type_id) AS devices_count
      FROM device_types dt`,
    search: ['name', 'category'],
    orderBy: 'type_id',
  },

  parameters: {
    table: 'parameters',
    pk: 'parameter_id',
    fields: {
      name: { label: 'Назва', required: true, max: 100 },
      unit: { label: 'Одиниця виміру', required: true, max: 20 },
    },
    listSql: 'SELECT * FROM parameters',
    search: ['name'],
    orderBy: 'parameter_id',
  },

  'event-types': {
    table: 'event_types',
    pk: 'event_type_id',
    fields: {
      name: { label: 'Назва', required: true, max: 100 },
      description: { label: 'Опис', max: 300 },
    },
    listSql: 'SELECT * FROM event_types',
    search: ['name'],
    orderBy: 'event_type_id',
  },

  devices: {
    table: 'devices',
    pk: 'device_id',
    fields: {
      name: { label: 'Назва', required: true, max: 150 },
      room_id: { label: 'Кімната', required: true, type: 'int' },
      type_id: { label: 'Тип пристрою', required: true, type: 'int' },
      manufacturer: { label: 'Виробник', max: 100 },
      serial_number: { label: 'Серійний номер', required: true, max: 50 },
      install_date: { label: 'Дата встановлення', default: 'CURRENT_DATE' },
      current_state: { label: 'Стан', enum: STATES, default: 'OFF', createOnly: true },
      work_mode: { label: 'Режим роботи', enum: ['AUTO', 'MANUAL'], default: 'MANUAL' },
    },
    listSql: `
      SELECT d.*, dt.name AS type_name, dt.category, r.name AS room_name,
             h.house_id, h.name AS house_name, pr.problem_reason, pr.problem_time
      FROM devices d
      JOIN device_types dt ON dt.type_id = d.type_id
      JOIN rooms r ON r.room_id = d.room_id
      JOIN houses h ON h.house_id = r.house_id
      LEFT JOIN LATERAL (
        SELECT COALESCE(e.description, et.name) AS problem_reason, e.event_time AS problem_time
        FROM events e JOIN event_types et ON et.event_type_id = e.event_type_id
        WHERE e.device_id = d.device_id AND d.current_state IN ('ERROR', 'OFFLINE')
        ORDER BY e.event_time DESC
        LIMIT 1
      ) pr ON TRUE`,
    filters: {
      house_id: 'house_id', room_id: 'room_id', type_id: 'type_id', work_mode: 'work_mode',
      current_state: (v, params) => {
        if (v === 'PROBLEM') return "current_state IN ('ERROR', 'OFFLINE')";
        params.push(v);
        return `current_state = $${params.length}`;
      },
    },
    search: ['name', 'serial_number', 'manufacturer', 'room_name', 'house_name'],
    orderBy: 'device_id',
  },

  'device-parameters': {
    table: 'device_parameters',
    pk: 'device_parameter_id',
    fields: {
      device_id: { label: 'Пристрій', required: true, type: 'int' },
      parameter_id: { label: 'Параметр', required: true, type: 'int' },
    },
    listSql: `
      SELECT dp.*, d.name AS device_name, p.name AS parameter_name, p.unit,
             d.name || ' — ' || p.name AS label,
             r.room_id, r.name AS room_name, h.house_id, h.name AS house_name
      FROM device_parameters dp
      JOIN devices d ON d.device_id = dp.device_id
      JOIN parameters p ON p.parameter_id = dp.parameter_id
      JOIN rooms r ON r.room_id = d.room_id
      JOIN houses h ON h.house_id = r.house_id`,
    filters: { device_id: 'device_id', parameter_id: 'parameter_id' },
    orderBy: 'house_id, room_id, device_id, parameter_id',
  },

  readings: {
    table: 'sensor_readings',
    pk: 'reading_id',
    fields: {
      device_parameter_id: { label: 'Датчик і параметр', required: true, type: 'int' },
      value: { label: 'Значення', required: true, type: 'number' },
      reading_time: { label: 'Час вимірювання', default: 'LOCALTIMESTAMP' },
    },
    listSql: `
      SELECT sr.*, dp.device_id, d.name AS device_name, p.parameter_id,
             p.name AS parameter_name, p.unit, r.name AS room_name, h.name AS house_name
      FROM sensor_readings sr
      JOIN device_parameters dp ON dp.device_parameter_id = sr.device_parameter_id
      JOIN devices d ON d.device_id = dp.device_id
      JOIN parameters p ON p.parameter_id = dp.parameter_id
      JOIN rooms r ON r.room_id = d.room_id
      JOIN houses h ON h.house_id = r.house_id`,
    filters: {
      device_parameter_id: 'device_parameter_id', device_id: 'device_id',
      parameter_id: 'parameter_id',
    },
    search: ['device_name', 'parameter_name'],
    orderBy: 'reading_time DESC, reading_id DESC',
  },

  events: {
    table: 'events',
    pk: 'event_id',
    fields: {
      device_id: { label: 'Пристрій', required: true, type: 'int' },
      event_type_id: { label: 'Тип події', required: true, type: 'int' },
      event_time: { label: 'Час події', default: 'LOCALTIMESTAMP' },
      description: { label: 'Опис', max: 300 },
      scenario_id: { label: 'Сценарій', type: 'int' },
    },
    listSql: 'SELECT * FROM v_events_full',
    filters: {
      house_id: 'house_id', room_id: 'room_id', device_id: 'device_id',
      event_type_id: 'event_type_id', scenario_id: 'scenario_id',
    },
    search: ['description', 'device_name', 'room_name', 'house_name'],
    orderBy: 'event_time DESC, event_id DESC',
  },

  history: {
    table: 'state_history',
    pk: 'history_id',
    fields: {
      device_id: { label: 'Пристрій', required: true, type: 'int' },
      old_state: { label: 'Старий стан', required: true, enum: STATES },
      new_state: { label: 'Новий стан', required: true, enum: STATES },
    },
    listSql: `
      SELECT sh.*, d.name AS device_name, r.name AS room_name, h.name AS house_name
      FROM state_history sh
      JOIN devices d ON d.device_id = sh.device_id
      JOIN rooms r ON r.room_id = d.room_id
      JOIN houses h ON h.house_id = r.house_id`,
    filters: { device_id: 'device_id' },
    search: ['device_name', 'room_name', 'house_name'],
    orderBy: 'changed_at DESC, history_id DESC',
  },

  scenarios: {
    table: 'automation_scenarios',
    pk: 'scenario_id',
    fields: {
      name: { label: 'Назва', required: true, max: 150 },
      description: { label: 'Опис', max: 300 },
      trigger_condition: { label: 'Умова запуску', required: true, max: 200 },
      action_description: { label: 'Дія', required: true, max: 200 },
      is_active: { label: 'Активний', type: 'int', enum: [0, 1], default: 1 },
      room_id: { label: 'Кімната', type: 'int' },
      device_id: { label: 'Пристрій', type: 'int' },
    },
    listSql: `
      SELECT s.*, r.name AS room_name, h.name AS house_name, d.name AS device_name,
             d.current_state AS device_state,
             (SELECT COUNT(*)::int FROM events e WHERE e.scenario_id = s.scenario_id) AS runs_count,
             (SELECT MAX(e.event_time) FROM events e WHERE e.scenario_id = s.scenario_id) AS last_run
      FROM automation_scenarios s
      LEFT JOIN rooms r ON r.room_id = s.room_id
      LEFT JOIN houses h ON h.house_id = r.house_id
      LEFT JOIN devices d ON d.device_id = s.device_id`,
    filters: { is_active: 'is_active', room_id: 'room_id' },
    search: ['name', 'description', 'room_name', 'device_name'],
    orderBy: 'is_active DESC, scenario_id DESC',
  },
};

module.exports = { entities, STATES };
