const express = require('express');
const { query } = require('./db');
const { adminOnly } = require('./middleware/auth');
const { asyncHandler, HttpError } = require('./middleware/errors');

function createCrudRouter(cfg) {
  const router = express.Router();
  const { table, pk, fields, listSql, filters = {}, search = [], orderBy } = cfg;

  function readBody(body, isUpdate) {
    const values = {};
    for (const [name, rule] of Object.entries(fields)) {
      if (isUpdate && rule.createOnly) continue;
      let v = body[name];
      if (v === '' || v === undefined) v = null;
      if (v === null) {
        if (rule.required && !isUpdate) {
          throw new HttpError(400, `Поле «${rule.label}» є обов'язковим`);
        }
        if (rule.required && isUpdate && name in body) {
          throw new HttpError(400, `Поле «${rule.label}» не може бути порожнім`);
        }
        if (!(name in body) && isUpdate) continue;
        if (rule.default !== undefined && !isUpdate) continue;
        values[name] = null;
        continue;
      }
      if (rule.type === 'int' || rule.type === 'number') {
        const n = Number(v);
        if (Number.isNaN(n)) throw new HttpError(400, `Поле «${rule.label}» має бути числом`);
        if (rule.type === 'int' && !Number.isInteger(n)) {
          throw new HttpError(400, `Поле «${rule.label}» має бути цілим числом`);
        }
        v = n;
      } else {
        v = String(v).trim();
        if (rule.max && v.length > rule.max) {
          throw new HttpError(400, `Поле «${rule.label}»: не більше ${rule.max} символів`);
        }
      }
      if (rule.enum && !rule.enum.includes(v)) {
        throw new HttpError(400, `Поле «${rule.label}» має недопустиме значення`);
      }
      values[name] = v;
    }
    return values;
  }

  router.get('/', asyncHandler(async (req, res) => {
    const where = [];
    const params = [];
    for (const [param, column] of Object.entries(filters)) {
      const v = req.query[param];
      if (v === undefined || v === '') continue;
      if (typeof column === 'function') {
        where.push(column(v, params));
      } else {
        params.push(v);
        where.push(`${column} = $${params.length}`);
      }
    }
    if (req.query.q && search.length) {
      params.push(`%${req.query.q}%`);
      where.push('(' + search.map((c) => `${c}::text ILIKE $${params.length}`).join(' OR ') + ')');
    }
    let sql = `SELECT * FROM (${listSql}) AS t`;
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ` ORDER BY ${orderBy || pk}`;
    if (req.query.limit) {
      params.push(Math.min(Number(req.query.limit) || 100, 1000));
      sql += ` LIMIT $${params.length}`;
    }
    res.json(await query(sql, params));
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const rows = await query(`SELECT * FROM (${listSql}) AS t WHERE ${pk} = $1`, [req.params.id]);
    if (!rows.length) throw new HttpError(404, 'Запис не знайдено');
    res.json(rows[0]);
  }));

  router.post('/', adminOnly, asyncHandler(async (req, res) => {
    const data = readBody(req.body, false);
    const cols = Object.keys(data);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const rows = await query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      Object.values(data)
    );
    res.status(201).json(rows[0]);
  }));

  router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
    const data = readBody(req.body, true);
    const cols = Object.keys(data);
    if (!cols.length) throw new HttpError(400, 'Немає даних для зміни');
    const sets = cols.map((c, i) => `${c} = $${i + 1}`);
    const rows = await query(
      `UPDATE ${table} SET ${sets.join(', ')} WHERE ${pk} = $${cols.length + 1} RETURNING *`,
      [...Object.values(data), req.params.id]
    );
    if (!rows.length) throw new HttpError(404, 'Запис не знайдено');
    res.json(rows[0]);
  }));

  router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const rows = await query(`DELETE FROM ${table} WHERE ${pk} = $1 RETURNING ${pk}`, [req.params.id]);
    if (!rows.length) throw new HttpError(404, 'Запис не знайдено');
    res.json({ deleted: rows[0][pk] });
  }));

  return router;
}

module.exports = { createCrudRouter };
