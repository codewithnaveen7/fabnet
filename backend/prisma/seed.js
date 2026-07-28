const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const ROUNDS = 10;

const DEFAULT_SERVICES = [
  { name: 'Design', description: null },
  { name: 'Manufacturing', description: null },
  { name: 'Inspection', description: null },
  { name: 'Logistics', description: null },
  { name: 'Packaging', description: null },
  { name: 'Certification', description: null },
];


async function seedCatalog() {
  for (const service of DEFAULT_SERVICES) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        status: 'ACTIVE',
      },
      create: {
        name: service.name,
        description: service.description,
        status: 'ACTIVE',
      },
    });
  }

  console.log('Catalog seeded: services');

}

async function main() {
  await seedCatalog();

  if (process.env.NODE_ENV === 'production') {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('Production: users already exist, skipping user seed.');
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
      itarRegistered: false,
      status: 'ACTIVE',
    },
    create: {
      userId: supplier.id,
      companyName: 'FabNet Manufacturing Co.',
      contactPerson: 'FabNet Supplier',
      phone: '+1-555-0100',
      address: '100 Industrial Park, Austin, TX',
      itarRegistered: false,
      status: 'ACTIVE',
    },
  });

  const serviceNames = ['Design', 'Manufacturing', 'Inspection'];
  for (const name of serviceNames) {
    const service = await prisma.service.findUnique({ where: { name } });
    if (!service) continue;

    await prisma.supplierService.upsert({
      where: {
        supplierId_serviceId: { supplierId: profile.id, serviceId: service.id },
      },
      update: {},
      create: { supplierId: profile.id, serviceId: service.id },
    });
  }

  // Mail test supplier — used for RFQ invite email verification
  const mailTestPassword = await bcrypt.hash('Supplier@123', ROUNDS);
  const mailTestUser = await prisma.user.upsert({
    where: { email: 'mynameisnaveensingh@gmail.com' },
    update: {
      name: 'Naveen Singh',
      password: mailTestPassword,
      role: 'SUPPLIER',
      status: 'ACTIVE',
      phone: '+91-9999999999',
    },
    create: {
      email: 'mynameisnaveensingh@gmail.com',
      name: 'Naveen Singh',
      password: mailTestPassword,
      role: 'SUPPLIER',
      status: 'ACTIVE',
      phone: '+91-9999999999',
    },
  });

  const mailTestProfile = await prisma.supplierProfile.upsert({
    where: { userId: mailTestUser.id },
    update: {
      companyName: 'Naveen Test Supplies',
      contactPerson: 'Naveen Singh',
      phone: '+91-9999999999',
      address: 'Test Address',
      itarRegistered: false,
      status: 'ACTIVE',
    },
    create: {
      userId: mailTestUser.id,
      companyName: 'Naveen Test Supplies',
      contactPerson: 'Naveen Singh',
      phone: '+91-9999999999',
      address: 'Test Address',
      itarRegistered: false,
      status: 'ACTIVE',
    },
  });

  for (const name of ['Manufacturing', 'Design', 'Inspection']) {
    const service = await prisma.service.findUnique({ where: { name } });
    if (!service) continue;
    await prisma.supplierService.upsert({
      where: {
        supplierId_serviceId: {
          supplierId: mailTestProfile.id,
          serviceId: service.id,
        },
      },
      update: {},
      create: { supplierId: mailTestProfile.id, serviceId: service.id },
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

  console.log('Seed completed:', {
    admin: admin.email,
    supplier: supplier.email,
    mailTestSupplier: mailTestUser.email,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
