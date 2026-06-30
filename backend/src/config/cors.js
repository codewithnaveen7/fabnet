const config = require('./env');

const origins = config.corsOrigin.split(',').map((o) => o.trim());

const corsOptions = {
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
