const { PrismaClient } = require('@prisma/client');
const config = require('../config/env');
const logger = require('../utils/logger');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      config.nodeEnv === 'development'
        ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
        : ['warn', 'error'],
  });

if (config.nodeEnv === 'development') {
  prisma.$on('query', (e) => {
    logger.debug({ query: e.query, durationMs: e.duration }, 'prisma query');
  });
}

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
