require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { pool } = require('./db');
const { authRequired } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errors');
const { createCrudRouter } = require('./crud');
const { entities } = require('./routes/entities');
const authRoutes = require('./routes/auth');
const operationRoutes = require('./routes/operations');
const reportRoutes = require('./routes/reports');
const { startScheduler } = require('./scheduler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', database: e.message });
  }
});

app.use('/api/auth', authRoutes);

app.use('/api', authRequired);
app.use('/api', operationRoutes);
app.use('/api/reports', reportRoutes);
for (const [route, cfg] of Object.entries(entities)) {
  app.use(`/api/${route}`, createCrudRouter(cfg));
}

app.use('/api', (req, res) => res.status(404).json({ message: 'Маршрут не знайдено' }));

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`SmartHome Monitor API запущено: http://localhost:${PORT}`);
  startScheduler();
});
