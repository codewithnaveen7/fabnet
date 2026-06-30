const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  next();
}

module.exports = validate;
