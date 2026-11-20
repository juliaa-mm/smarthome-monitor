const { Pool, types } = require('pg');

types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
types.setTypeParser(1114, (v) => v);
types.setTypeParser(1082, (v) => v);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'smarthome',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  options: `-c timezone=${process.env.DB_TIMEZONE || 'Europe/Kyiv'}`,
});

pool.on('error', (err) => {
  console.error('Помилка пулу з\'єднань PostgreSQL:', err.message);
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
