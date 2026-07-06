const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');

const supplierListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  supplierProfile: {
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      address: true,
      status: true,
      services: { select: { serviceType: true } },
    },
  },
};

async function listSuppliers() {
  return prisma.user.findMany({
    where: { role: 'SUPPLIER' },
    select: supplierListSelect,
    orderBy: { createdAt: 'desc' },
  });
}

async function createSupplier({
  name,
  email,
  password,
  phone,
  companyName,
  contactPerson,
  address,
  services = [],
}) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email is already in use');
  }

  const hashedPassword = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'SUPPLIER',
        status: 'ACTIVE',
      },
    });

    const profile = await tx.supplierProfile.create({
      data: {
        userId: user.id,
        companyName,
        contactPerson,
        phone: phone || null,
        address: address || null,
        status: 'ACTIVE',
      },
    });

    if (services.length) {
      await tx.supplierService.createMany({
        data: services.map((serviceType) => ({
          supplierId: profile.id,
          serviceType,
        })),
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      select: supplierListSelect,
    });
  });
}

module.exports = { listSuppliers, createSupplier };
