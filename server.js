// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const shipmentsRouter = require('./routes/shipments');

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const corsOrigin = '*';
app.use(cors({ origin: corsOrigin }));

// Routes
app.use('/api/shipments', shipmentsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
