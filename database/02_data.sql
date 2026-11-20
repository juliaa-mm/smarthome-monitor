BEGIN;

INSERT INTO houses VALUES (1, 'Квартира на Оболоні', 'просп. Оболонський, 12', 'Київ');
INSERT INTO houses VALUES (2, 'Будинок у Борисполі', 'вул. Садова, 5', 'Бориспіль');
INSERT INTO houses VALUES (3, 'Квартира на Подолі', 'вул. Хорива, 21', 'Київ');
INSERT INTO houses VALUES (4, 'Дача в Ірпені', 'вул. Лісова, 8', 'Ірпінь');
INSERT INTO houses VALUES (5, 'Квартира у Львові', 'вул. Зелена, 33', 'Львів');

INSERT INTO device_types VALUES (1, 'Лампа', 'Освітлення', 'Розумна лампа з керуванням яскравістю');
INSERT INTO device_types VALUES (2, 'Датчик клімату', 'Сенсор', 'Вимірює температуру, вологість та освітленість');
INSERT INTO device_types VALUES (3, 'Розумна розетка', 'Живлення', 'Вмикає та вимикає прилади дистанційно');
INSERT INTO device_types VALUES (4, 'Камера', 'Безпека', 'Відеоспостереження та виявлення руху');
INSERT INTO device_types VALUES (5, 'Термостат', 'Клімат', 'Керує температурою в приміщенні');
INSERT INTO device_types VALUES (6, 'Датчик руху', 'Безпека', 'Реагує на рух у приміщенні');
INSERT INTO device_types VALUES (7, 'Розумний замок', 'Безпека', 'Керує доступом до дверей');

INSERT INTO parameters VALUES (1, 'Температура', '°C');
INSERT INTO parameters VALUES (2, 'Вологість', '%');
INSERT INTO parameters VALUES (3, 'Освітленість', 'лк');
INSERT INTO parameters VALUES (4, 'Споживання електроенергії', 'Вт');
INSERT INTO parameters VALUES (5, 'Концентрація CO2', 'ppm');
INSERT INTO parameters VALUES (6, 'Рівень заряду батареї', '%');

INSERT INTO event_types VALUES (1, 'Увімкнення', 'Пристрій було увімкнено');
INSERT INTO event_types VALUES (2, 'Вимкнення', 'Пристрій було вимкнено');
INSERT INTO event_types VALUES (3, 'Помилка пристрою', 'Пристрій повідомив про помилку');
INSERT INTO event_types VALUES (4, 'Виявлення руху', 'Зафіксовано рух у приміщенні');
INSERT INTO event_types VALUES (5, 'Втрата підключення', 'Пристрій перестав виходити на зв''язок');
INSERT INTO event_types VALUES (6, 'Перевищення порогу', 'Показник перевищив допустиме значення');

INSERT INTO rooms VALUES (1, 1, 'Вітальня', 1);
INSERT INTO rooms VALUES (2, 1, 'Спальня', 1);
INSERT INTO rooms VALUES (3, 1, 'Кухня', 1);
INSERT INTO rooms VALUES (4, 2, 'Вітальня', 1);
INSERT INTO rooms VALUES (5, 2, 'Спальня', 2);
INSERT INTO rooms VALUES (6, 2, 'Кухня', 1);
INSERT INTO rooms VALUES (7, 3, 'Вітальня', 3);
INSERT INTO rooms VALUES (8, 3, 'Кабінет', 3);
INSERT INTO rooms VALUES (9, 4, 'Веранда', 1);
INSERT INTO rooms VALUES (10, 5, 'Спальня', 2);

INSERT INTO devices VALUES (1, 1, 1, 'Лампа вітальні', 'Philips Hue', 'PH-1001', DATE '2025-01-15', 'ON', 'AUTO');
INSERT INTO devices VALUES (2, 1, 2, 'Датчик клімату вітальні', 'Xiaomi', 'XM-2001', DATE '2025-01-15', 'ON', 'AUTO');
INSERT INTO devices VALUES (3, 1, 4, 'Камера вітальні', 'TP-Link', 'TP-3001', DATE '2025-02-03', 'ON', 'MANUAL');
INSERT INTO devices VALUES (4, 2, 1, 'Лампа спальні', 'Philips Hue', 'PH-1002', DATE '2025-01-16', 'OFF', 'AUTO');
INSERT INTO devices VALUES (5, 2, 2, 'Датчик клімату спальні', 'Xiaomi', 'XM-2002', DATE '2025-01-16', 'ON', 'AUTO');
INSERT INTO devices VALUES (6, 3, 3, 'Розетка кухні', 'TP-Link', 'TP-4001', DATE '2025-03-10', 'OFF', 'MANUAL');
INSERT INTO devices VALUES (7, 3, 5, 'Термостат кухні', 'Tado', 'TD-5001', DATE '2025-03-12', 'ON', 'AUTO');
INSERT INTO devices VALUES (8, 4, 1, 'Лампа вітальні Бориспіль', 'IKEA', 'IK-1003', DATE '2025-04-01', 'ON', 'AUTO');
INSERT INTO devices VALUES (9, 4, 2, 'Датчик клімату Бориспіль', 'Aqara', 'AQ-2003', DATE '2025-04-01', 'ERROR', 'AUTO');
INSERT INTO devices VALUES (10, 5, 5, 'Термостат спальні Бориспіль', 'Tado', 'TD-5002', DATE '2025-04-05', 'ON', 'AUTO');
INSERT INTO devices VALUES (11, 7, 4, 'Камера Поділ', 'Xiaomi', 'XM-3002', DATE '2025-05-20', 'ON', 'MANUAL');
INSERT INTO devices VALUES (12, 7, 6, 'Датчик руху Поділ', 'Aqara', 'AQ-6001', DATE '2025-05-20', 'ON', 'AUTO');
INSERT INTO devices VALUES (13, 8, 3, 'Розетка кабінету', 'IKEA', 'IK-4002', DATE '2025-06-02', 'OFF', 'MANUAL');
INSERT INTO devices VALUES (14, 9, 2, 'Датчик клімату веранди', 'Xiaomi', 'XM-2004', DATE '2025-06-15', 'OFFLINE', 'AUTO');
INSERT INTO devices VALUES (15, 10, 1, 'Лампа спальні Львів', 'Philips Hue', 'PH-1004', DATE '2025-07-01', 'ON', 'AUTO');

INSERT INTO device_parameters VALUES (1, 2, 1);
INSERT INTO device_parameters VALUES (2, 2, 2);
INSERT INTO device_parameters VALUES (3, 5, 1);
INSERT INTO device_parameters VALUES (4, 5, 2);
INSERT INTO device_parameters VALUES (5, 9, 1);
INSERT INTO device_parameters VALUES (6, 9, 2);
INSERT INTO device_parameters VALUES (7, 14, 1);
INSERT INTO device_parameters VALUES (8, 14, 2);
INSERT INTO device_parameters VALUES (9, 6, 4);
INSERT INTO device_parameters VALUES (10, 13, 4);
INSERT INTO device_parameters VALUES (11, 7, 1);
INSERT INTO device_parameters VALUES (12, 10, 1);
INSERT INTO device_parameters VALUES (13, 12, 3);
INSERT INTO device_parameters VALUES (14, 2, 3);
INSERT INTO device_parameters VALUES (15, 14, 6);

INSERT INTO sensor_readings VALUES (1, 1, 21.50, TIMESTAMP '2026-10-26 08:00:00');
INSERT INTO sensor_readings VALUES (2, 1, 22.30, TIMESTAMP '2026-10-26 14:00:00');
INSERT INTO sensor_readings VALUES (3, 1, 22.80, TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO sensor_readings VALUES (4, 2, 45.00, TIMESTAMP '2026-10-26 08:00:00');
INSERT INTO sensor_readings VALUES (5, 2, 47.50, TIMESTAMP '2026-10-26 14:00:00');
INSERT INTO sensor_readings VALUES (6, 2, 44.20, TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO sensor_readings VALUES (7, 3, 20.10, TIMESTAMP '2026-10-26 08:00:00');
INSERT INTO sensor_readings VALUES (8, 3, 19.80, TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO sensor_readings VALUES (9, 4, 50.30, TIMESTAMP '2026-10-26 08:00:00');
INSERT INTO sensor_readings VALUES (10, 4, 52.10, TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO sensor_readings VALUES (11, 5, 23.40, TIMESTAMP '2026-10-26 09:00:00');
INSERT INTO sensor_readings VALUES (12, 5, 35.90, TIMESTAMP '2026-10-27 09:00:00');
INSERT INTO sensor_readings VALUES (13, 6, 40.00, TIMESTAMP '2026-10-26 09:00:00');
INSERT INTO sensor_readings VALUES (14, 7, 12.40, TIMESTAMP '2026-10-25 18:00:00');
INSERT INTO sensor_readings VALUES (15, 7, 10.80, TIMESTAMP '2026-10-25 22:00:00');
INSERT INTO sensor_readings VALUES (16, 8, 78.00, TIMESTAMP '2026-10-25 18:00:00');
INSERT INTO sensor_readings VALUES (17, 9, 120.50, TIMESTAMP '2026-10-26 19:00:00');
INSERT INTO sensor_readings VALUES (18, 9, 15.20, TIMESTAMP '2026-10-27 19:00:00');
INSERT INTO sensor_readings VALUES (19, 10, 0.00, TIMESTAMP '2026-10-27 12:00:00');
INSERT INTO sensor_readings VALUES (20, 11, 21.00, TIMESTAMP '2026-10-27 07:30:00');
INSERT INTO sensor_readings VALUES (21, 11, 21.50, TIMESTAMP '2026-10-27 18:00:00');
INSERT INTO sensor_readings VALUES (22, 12, 18.50, TIMESTAMP '2026-10-27 07:30:00');
INSERT INTO sensor_readings VALUES (23, 13, 320.00, TIMESTAMP '2026-10-27 12:00:00');
INSERT INTO sensor_readings VALUES (24, 13, 15.00, TIMESTAMP '2026-10-27 21:00:00');
INSERT INTO sensor_readings VALUES (25, 14, 150.00, TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO sensor_readings VALUES (26, 15, 45.00, TIMESTAMP '2026-10-25 18:00:00');

SELECT setseed(0.42);

INSERT INTO sensor_readings (reading_id, device_parameter_id, value, reading_time)
SELECT 26 + ROW_NUMBER() OVER (ORDER BY d.ts, p.dp),
       p.dp,
       CASE p.kind
         WHEN 'lux' THEN ROUND((CASE
             WHEN EXTRACT(HOUR FROM d.ts) BETWEEN 7 AND 17
               THEN p.base * SIN(PI() * (EXTRACT(HOUR FROM d.ts) - 6) / 12) * (0.7 + 0.3 * random())
             WHEN EXTRACT(HOUR FROM d.ts) BETWEEN 18 AND 22
               THEN 110 + 40 * random()
             ELSE 2 * random()
           END)::NUMERIC, 0)
         ELSE ROUND((p.base
             + p.amp * COS(2 * PI() * (EXTRACT(HOUR FROM d.ts) - 15) / 24)
             + 1.2 * SIN(EXTRACT(EPOCH FROM d.ts) / 390000.0 + p.dp)
             + 0.6 * SIN(EXTRACT(EPOCH FROM d.ts) / 150000.0 + 2 * p.dp)
             + p.noise * (random() - 0.5))::NUMERIC, 1)
       END,
       d.ts
FROM generate_series(TIMESTAMP '2026-10-28 00:00:00', LOCALTIMESTAMP, INTERVAL '3 hours') AS d(ts)
CROSS JOIN (VALUES ( 1, 'temp', 22.0,  0.9, 0.9),
                   ( 2, 'hum',  46.0, -3.0, 3.0),
                   ( 3, 'temp', 20.0,  0.7, 0.8),
                   ( 4, 'hum',  50.0, -2.5, 3.0),
                   (11, 'temp', 23.0,  1.4, 1.0),
                   (12, 'temp', 21.0,  0.4, 0.6),
                   (13, 'lux', 400.0,  0.0, 0.0),
                   (14, 'lux', 350.0,  0.0, 0.0))
     AS p(dp, kind, base, amp, noise)
ORDER BY d.ts, p.dp;

INSERT INTO automation_scenarios VALUES (1, 'Вечірнє освітлення вітальні', 'Вмикає світло у вітальні ввечері', 'Час 19:00', 'Увімкнути лампу', 1, 1, 1);
INSERT INTO automation_scenarios VALUES (2, 'Нічне вимкнення світла в спальні', 'Вимикає світло в спальні вночі', 'Час 23:00', 'Вимкнути лампу', 1, 2, 4);
INSERT INTO automation_scenarios VALUES (3, 'Захист від перегріву на кухні', 'Вимикає розетку, якщо на кухні занадто тепло', 'Температура вище 30 °C', 'Вимкнути розетку', 1, 3, 6);
INSERT INTO automation_scenarios VALUES (4, 'Охорона вітальні на Подолі', 'Вмикає запис камери при русі', 'Виявлено рух у вітальні', 'Увімкнути запис камери', 1, 7, 11);
INSERT INTO automation_scenarios VALUES (5, 'Підтримка тепла в спальні Борисполя', 'Вмикає термостат, коли стає холодно', 'Температура нижче 18 °C', 'Увімкнути термостат', 1, 5, 10);
INSERT INTO automation_scenarios VALUES (6, 'Контроль вологості на веранді', 'Повідомляє власника про високу вологість', 'Вологість вище 80 %', 'Надіслати повідомлення власнику', 0, 9, NULL);
INSERT INTO automation_scenarios VALUES (7, 'Енергозбереження в кабінеті', 'Вимикає розетку, коли в кабінеті нікого немає', 'Немає руху 30 хвилин', 'Вимкнути розетку', 0, NULL, 13);

INSERT INTO events VALUES (1, 1, 1, TIMESTAMP '2026-10-26 07:00:00', 'Лампа увімкнена за розкладом', 1);
INSERT INTO events VALUES (2, 1, 2, TIMESTAMP '2026-10-26 23:00:00', 'Лампа вимкнена за розкладом', NULL);
INSERT INTO events VALUES (3, 1, 1, TIMESTAMP '2026-10-27 07:00:00', 'Лампа увімкнена за розкладом', 1);
INSERT INTO events VALUES (4, 3, 4, TIMESTAMP '2026-10-26 02:15:00', 'Камера зафіксувала рух у вітальні', NULL);
INSERT INTO events VALUES (5, 3, 4, TIMESTAMP '2026-10-27 03:40:00', 'Камера зафіксувала рух у вітальні', NULL);
INSERT INTO events VALUES (6, 4, 2, TIMESTAMP '2026-10-26 22:30:00', 'Лампа спальні вимкнена', 2);
INSERT INTO events VALUES (7, 4, 1, TIMESTAMP '2026-10-25 06:45:00', 'Лампа спальні увімкнена', NULL);
INSERT INTO events VALUES (8, 6, 1, TIMESTAMP '2026-10-26 18:50:00', 'Розетка кухні увімкнена', NULL);
INSERT INTO events VALUES (9, 6, 2, TIMESTAMP '2026-10-27 08:10:00', 'Розетка кухні вимкнена', 3);
INSERT INTO events VALUES (10, 7, 6, TIMESTAMP '2026-10-27 18:05:00', 'Температура вища за заданий поріг', NULL);
INSERT INTO events VALUES (11, 9, 3, TIMESTAMP '2026-10-27 09:05:00', 'Датчик передав помилку вимірювання', NULL);
INSERT INTO events VALUES (12, 9, 6, TIMESTAMP '2026-10-27 09:00:00', 'Температура перевищила критичне значення', NULL);
INSERT INTO events VALUES (13, 11, 4, TIMESTAMP '2026-10-26 23:40:00', 'Камера зафіксувала рух біля входу', 4);
INSERT INTO events VALUES (14, 12, 4, TIMESTAMP '2026-10-27 21:00:00', 'Датчик руху спрацював у вітальні', NULL);
INSERT INTO events VALUES (15, 12, 4, TIMESTAMP '2026-10-27 21:10:00', 'Датчик руху спрацював у вітальні', NULL);
INSERT INTO events VALUES (16, 13, 2, TIMESTAMP '2026-10-27 12:00:00', 'Розетка кабінету вимкнена', NULL);
INSERT INTO events VALUES (17, 14, 5, TIMESTAMP '2026-10-25 22:30:00', 'Втрачено підключення до датчика', NULL);
INSERT INTO events VALUES (18, 8, 1, TIMESTAMP '2026-10-27 17:30:00', 'Лампа увімкнена', NULL);
INSERT INTO events VALUES (19, 15, 1, TIMESTAMP '2026-10-27 20:00:00', 'Лампа увімкнена', NULL);
INSERT INTO events VALUES (20, 10, 2, TIMESTAMP '2026-10-27 08:00:00', 'Термостат вимкнено', NULL);
INSERT INTO events VALUES (21, 10, 1, TIMESTAMP '2026-10-28 06:30:00', 'Термостат увімкнено сценарієм автоматизації', 5);

INSERT INTO state_history VALUES (1, 1, 'OFF', 'ON', TIMESTAMP '2026-10-26 07:00:00');
INSERT INTO state_history VALUES (2, 1, 'ON', 'OFF', TIMESTAMP '2026-10-26 23:00:00');
INSERT INTO state_history VALUES (3, 1, 'OFF', 'ON', TIMESTAMP '2026-10-27 07:00:00');
INSERT INTO state_history VALUES (4, 4, 'OFF', 'ON', TIMESTAMP '2026-10-25 06:45:00');
INSERT INTO state_history VALUES (5, 4, 'ON', 'OFF', TIMESTAMP '2026-10-26 22:30:00');
INSERT INTO state_history VALUES (6, 6, 'OFF', 'ON', TIMESTAMP '2026-10-26 18:50:00');
INSERT INTO state_history VALUES (7, 6, 'ON', 'OFF', TIMESTAMP '2026-10-27 08:10:00');
INSERT INTO state_history VALUES (8, 9, 'ON', 'ERROR', TIMESTAMP '2026-10-27 09:05:00');
INSERT INTO state_history VALUES (9, 13, 'ON', 'OFF', TIMESTAMP '2026-10-27 12:00:00');
INSERT INTO state_history VALUES (10, 14, 'ON', 'OFFLINE', TIMESTAMP '2026-10-25 22:30:00');
INSERT INTO state_history VALUES (11, 8, 'OFF', 'ON', TIMESTAMP '2026-10-27 17:30:00');
INSERT INTO state_history VALUES (12, 15, 'OFF', 'ON', TIMESTAMP '2026-10-27 20:00:00');
INSERT INTO state_history VALUES (13, 10, 'ON', 'OFF', TIMESTAMP '2026-10-27 08:00:00');
INSERT INTO state_history VALUES (14, 10, 'OFF', 'ON', TIMESTAMP '2026-10-28 06:30:00');

INSERT INTO app_users (user_id, login, password_hash, full_name, role) VALUES
 (1, 'admin',  '$2b$10$HL4BtJnO6gK.tZhiLTRLreKG49449EMwWPt3tSqpsIWfZ5Jfvu4kK', 'Юлія Москаленко',       'ADMIN'),
 (2, 'viewer', '$2b$10$qapoM.aAwBJq8g4NJyNJeuJiO3E.YzpaJai2Uv6MGnmE0K2LYlu4y', 'Гість',                 'VIEWER');

COMMIT;

SELECT setval(pg_get_serial_sequence('houses', 'house_id'), (SELECT MAX(house_id) FROM houses));
SELECT setval(pg_get_serial_sequence('rooms', 'room_id'), (SELECT MAX(room_id) FROM rooms));
SELECT setval(pg_get_serial_sequence('device_types', 'type_id'), (SELECT MAX(type_id) FROM device_types));
SELECT setval(pg_get_serial_sequence('parameters', 'parameter_id'), (SELECT MAX(parameter_id) FROM parameters));
SELECT setval(pg_get_serial_sequence('event_types', 'event_type_id'), (SELECT MAX(event_type_id) FROM event_types));
SELECT setval(pg_get_serial_sequence('devices', 'device_id'), (SELECT MAX(device_id) FROM devices));
SELECT setval(pg_get_serial_sequence('device_parameters', 'device_parameter_id'), (SELECT MAX(device_parameter_id) FROM device_parameters));
SELECT setval(pg_get_serial_sequence('sensor_readings', 'reading_id'), (SELECT MAX(reading_id) FROM sensor_readings));
SELECT setval(pg_get_serial_sequence('automation_scenarios', 'scenario_id'), (SELECT MAX(scenario_id) FROM automation_scenarios));
SELECT setval(pg_get_serial_sequence('events', 'event_id'), (SELECT MAX(event_id) FROM events));
SELECT setval(pg_get_serial_sequence('state_history', 'history_id'), (SELECT MAX(history_id) FROM state_history));
SELECT setval(pg_get_serial_sequence('app_users', 'user_id'), (SELECT MAX(user_id) FROM app_users));
