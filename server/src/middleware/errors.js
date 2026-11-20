const PG_MESSAGES = {
  '23505': 'Запис з таким значенням уже існує (порушено унікальність)',
  '23503': 'Операцію неможливо виконати: є пов\'язані записи або вказаний запис не існує',
  '23514': 'Значення не відповідає правилам перевірки (CHECK)',
  '23502': 'Не заповнено обов\'язкове поле',
  '22P02': 'Неправильний формат значення',
  '22007': 'Неправильний формат дати або часу',
  '22003': 'Число виходить за допустимі межі',
  '55P03': 'Запис зараз змінюється іншим користувачем, спробуйте ще раз',
};

const CONSTRAINT_MESSAGES = {
  uq_devices_serial: 'Пристрій з таким серійним номером уже існує',
  uq_houses_address: 'Будинок з такою адресою вже є в системі',
  uq_rooms_house_name: 'У цьому будинку вже є кімната з такою назвою',
  uq_dp_device_param: 'Цей пристрій уже вимірює вибраний параметр',
  uq_device_types_name: 'Тип пристрою з такою назвою вже існує',
  uq_parameters_name: 'Параметр з такою назвою вже існує',
  uq_event_types_name: 'Тип події з такою назвою вже існує',
  fk_rooms_house: 'Неможливо видалити будинок: у ньому є кімнати',
  fk_devices_room: 'Неможливо видалити кімнату: у ній встановлено пристрої',
  fk_devices_type: 'Неможливо видалити тип: є пристрої цього типу',
  fk_events_scenario: 'Неможливо видалити сценарій: він уже спрацьовував (є події). Зробіть його неактивним',
  fk_events_device: 'Неможливо видалити пристрій: для нього є записи в журналі подій',
  fk_history_device: 'Неможливо видалити пристрій: для нього є історія станів',
  fk_dp_device: 'Неможливо видалити пристрій: до нього прив\'язані параметри вимірювання',
  fk_readings_dp: 'Неможливо видалити зв\'язок: для нього є показники сенсорів',
  fk_scenarios_device: 'Неможливо видалити пристрій: він використовується у сценарії',
  fk_scenarios_room: 'Неможливо видалити кімнату: вона використовується у сценарії',
  ck_rooms_floor: 'Поверх має бути в межах від 0 до 50',
  ck_scenarios_target: 'Сценарій має бути прив\'язаний до кімнати, пристрою або до обох',
  ck_history_diff: 'Новий стан має відрізнятися від попереднього',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err.code && PG_MESSAGES[err.code]) {
    return res.status(err.code === '55P03' ? 409 : 400).json({
      message: CONSTRAINT_MESSAGES[err.constraint] || PG_MESSAGES[err.code],
      constraint: err.constraint || null,
    });
  }
  console.error(err);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
}

module.exports = { HttpError, asyncHandler, errorHandler };
