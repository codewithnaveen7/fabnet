const config = require('./config/env');
const logger = require('./utils/logger');
const createApp = require('./app');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'FabNet API server started');
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});
