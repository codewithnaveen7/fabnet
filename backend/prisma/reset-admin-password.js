const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const ROUNDS = 10;
const ADMIN_EMAIL = 'admin@fabnetsystems.com';
const ADMIN_PASSWORD = 'Admin@123';

async function main() {
  const password = await bcrypt.hash(ADMIN_PASSWORD, ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: ADMIN_EMAIL,
      name: 'FabNet Admin',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+1-555-0001',
    },
  });

  console.log(`Admin password reset for ${admin.email}`);
  console.log(`Login with password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
