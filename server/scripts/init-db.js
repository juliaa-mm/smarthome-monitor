require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};
const dbName = process.env.DB_NAME || 'smarthome';

(async () => {
  const admin = new Client({ ...cfg, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rowCount) {
    await admin.query(`CREATE DATABASE ${dbName} ENCODING 'UTF8'`);
    console.log(`Створено базу даних «${dbName}»`);
  }
  await admin.end();

  const db = new Client({ ...cfg, database: dbName });
  await db.connect();
  if (process.argv.includes('--if-empty')) {
    const has = await db.query("SELECT to_regclass('public.devices') IS NOT NULL AS ok");
    if (has.rows[0].ok) {
      console.log('База даних уже існує, ініціалізацію пропущено');
      await db.end();
      return;
    }
  }
  const dir = path.join(__dirname, '..', '..', 'database');
  const files = fs.readdirSync(dir).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();
  for (const f of files) {
    await db.query(fs.readFileSync(path.join(dir, f), 'utf8'));
    console.log(`Виконано ${f}`);
  }
  const counts = await db.query(
    "SELECT (SELECT COUNT(*) FROM devices) AS devices, (SELECT COUNT(*) FROM events) AS events"
  );
  console.log(`Готово: пристроїв ${counts.rows[0].devices}, подій ${counts.rows[0].events}`);
  await db.end();
})().catch((e) => {
  console.error('Помилка ініціалізації БД:', e.message);
  process.exit(1);
});
