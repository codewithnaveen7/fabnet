const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const logger = require('../utils/logger');

function notFoundHandler(_req, _res, next) {
  next(ApiError.notFound('Route not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof ApiError || err.isOperational;

  if (!isOperational || statusCode >= 500) {
    logger.error({ err }, 'request error');
  } else {
    logger.warn({ err: { message: err.message, statusCode } }, 'operational error');
  }

  const response = {
    success: false,
    message: isOperational ? err.message : 'Internal server error',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (config.nodeEnv === 'development' && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
