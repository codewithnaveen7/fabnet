const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), config.jwt.secret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('User not found or inactive');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
