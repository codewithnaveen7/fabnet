const ApiError = require('../utils/ApiError');

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

module.exports = requireRole;
