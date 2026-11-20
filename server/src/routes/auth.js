const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authRequired } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errors');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) throw new HttpError(400, 'Введіть логін і пароль');

  const rows = await query('SELECT * FROM app_users WHERE login = $1', [String(login).trim()]);
  const ok = rows.length && (await bcrypt.compare(String(password), rows[0].password_hash));
  if (!ok) throw new HttpError(401, 'Неправильний логін або пароль');

  const user = rows[0];
  res.json({
    token: signToken(user),
    user: { id: user.user_id, login: user.login, name: user.full_name, role: user.role },
  });
}));

router.get('/me', authRequired, (req, res) => {
  res.json({ id: req.user.id, login: req.user.login, name: req.user.name, role: req.user.role });
});

module.exports = router;
