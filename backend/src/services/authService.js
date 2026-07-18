const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const { comparePassword, hashPassword } = require('../utils/password');

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  supplierProfile: {
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      address: true,
      status: true,
      itarRegistered: true,
      services: {
        select: {
          id: true,
          serviceId: true,
          createdAt: true,
          service: { select: { id: true, name: true, status: true } },
        },
      },
    },
  },
};

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status !== 'ACTIVE') {
    throw ApiError.forbidden('Account is not active');
  }

  const publicUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  return { token: signToken(publicUser), user: publicUser };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateProfile(userId, { name, email, phone }) {
  if (email) {
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
    if (existing) throw ApiError.conflict('Email is already in use');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name, email, phone },
    select: userSelect,
  });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (!(await comparePassword(currentPassword, user.password))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(newPassword) },
  });

  return { message: 'Password updated successfully' };
}

module.exports = { login, getMe, updateProfile, changePassword };
