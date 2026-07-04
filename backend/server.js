require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(compression());          // gzip all responses → smaller payloads
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/batches',      require('./routes/batches'));
app.use('/api/members',      require('./routes/members'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/menu',         require('./routes/menu'));
app.use('/api/summary',      require('./routes/summary'));
app.use('/api/bills',        require('./routes/bills'));
app.use('/api/complaints',   require('./routes/complaints'));
app.use('/api/food-requests',require('./routes/foodRequests'));
app.use('/api/holidays',     require('./routes/holiday'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.status(200).json({ status: 'ok', message: 'VJ Home Foods API Running' })
);

// ── Start only after DB connects ──────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 User Portal Backend running on http://localhost:${PORT}`);
  });
}

startServer();
