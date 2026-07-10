const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const ROUNDS = 10;

async function main() {
  if (process.env.NODE_ENV === 'production') {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('Production: users already exist, skipping seed.');
      return;
    }
    console.log('Production: empty database, creating default users...');
  }

  const adminPassword = await bcrypt.hash('Admin@123', ROUNDS);
  const supplierPassword = await bcrypt.hash('Supplier@123', ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fabnetsystems.com' },
    update: {
      name: 'FabNet Admin',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+1-555-0001',
    },
    create: {
      email: 'admin@fabnetsystems.com',
      name: 'FabNet Admin',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+1-555-0001',
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@fabnetsystems.com' },
    update: {
      name: 'FabNet Supplier',
      password: supplierPassword,
      role: 'SUPPLIER',
      status: 'ACTIVE',
      phone: '+1-555-0002',
    },
    create: {
      email: 'supplier@fabnetsystems.com',
      name: 'FabNet Supplier',
      password: supplierPassword,
      role: 'SUPPLIER',
      status: 'ACTIVE',
      phone: '+1-555-0002',
    },
  });

  const profile = await prisma.supplierProfile.upsert({
    where: { userId: supplier.id },
    update: {
      companyName: 'FabNet Manufacturing Co.',
      contactPerson: 'FabNet Supplier',
      phone: '+1-555-0100',
      address: '100 Industrial Park, Austin, TX',
      status: 'ACTIVE',
    },
    create: {
      userId: supplier.id,
      companyName: 'FabNet Manufacturing Co.',
      contactPerson: 'FabNet Supplier',
      phone: '+1-555-0100',
      address: '100 Industrial Park, Austin, TX',
      status: 'ACTIVE',
    },
  });

  for (const serviceType of ['DESIGN', 'MANUFACTURING', 'INSPECTION']) {
    await prisma.supplierService.upsert({
      where: {
        supplierId_serviceType: { supplierId: profile.id, serviceType },
      },
      update: {},
      create: { supplierId: profile.id, serviceType },
    });
  }

  await prisma.client.upsert({
    where: { email: 'contact@fabnetsystems.com' },
    update: {
      companyName: 'FabNet Systems',
      contactPerson: 'Client Contact',
      phone: '+1-555-0200',
      address: '200 Business Center, Austin, TX',
      status: 'ACTIVE',
    },
    create: {
      companyName: 'FabNet Systems',
      contactPerson: 'Client Contact',
      email: 'contact@fabnetsystems.com',
      phone: '+1-555-0200',
      address: '200 Business Center, Austin, TX',
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed:', { admin: admin.email, supplier: supplier.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
