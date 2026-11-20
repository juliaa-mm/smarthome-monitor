const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smarthome-monitor-dev-secret';
const TOKEN_TTL = '8h';

function signToken(user) {
  return jwt.sign(
    { id: user.user_id, login: user.login, name: user.full_name, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Потрібно увійти в систему' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Сесія завершилася, увійдіть повторно' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Недостатньо прав: дія доступна лише адміністратору' });
  }
  next();
}

module.exports = { signToken, authRequired, adminOnly };
