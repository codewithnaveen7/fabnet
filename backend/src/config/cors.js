const config = require('./env');
const logger = require('../utils/logger');

const origins = config.corsOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Same-origin / server-to-server / curl (no Origin header)
    if (!origin || origins.includes(origin)) {
      callback(null, true);
      return;
    }
    logger.warn({ origin, allowed: origins }, 'CORS blocked');
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
