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

const BULK_MAX_ROWS = 100;
const DEFAULT_BULK_PASSWORD = 'Supplier@123';

function normalizeBulkRow(row) {
  return {
    name: row.name?.trim(),
    email: row.email?.trim().toLowerCase(),
    password: row.password?.trim() || DEFAULT_BULK_PASSWORD,
    phone: row.phone?.trim() || '',
    companyName: row.companyName?.trim(),
    contactPerson: row.contactPerson?.trim(),
    address: row.address?.trim() || '',
    services: Array.isArray(row.services) ? row.services : [],
  };
}

async function bulkCreateSuppliers(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw ApiError.badRequest('At least one supplier row is required');
  }
  if (rows.length > BULK_MAX_ROWS) {
    throw ApiError.badRequest(`Maximum ${BULK_MAX_ROWS} suppliers per upload`);
  }

  const created = [];
  const failed = [];
  const seenEmails = new Set();

  for (let i = 0; i < rows.length; i += 1) {
    const rowNumber = rows[i].row ?? i + 1;
    const normalized = normalizeBulkRow(rows[i]);

    if (!normalized.name || !normalized.email || !normalized.companyName || !normalized.contactPerson) {
      failed.push({
        row: rowNumber,
        email: normalized.email || null,
        message: 'name, email, company_name, and contact_person are required',
      });
      continue;
    }

    if (normalized.password.length < 8) {
      failed.push({
        row: rowNumber,
        email: normalized.email,
        message: 'password must be at least 8 characters',
      });
      continue;
    }

    if (seenEmails.has(normalized.email)) {
      failed.push({
        row: rowNumber,
        email: normalized.email,
        message: 'duplicate email in upload file',
      });
      continue;
    }
    seenEmails.add(normalized.email);

    try {
      const supplier = await createSupplier(normalized);
      created.push({
        row: rowNumber,
        email: supplier.email,
        id: supplier.id,
      });
    } catch (err) {
      failed.push({
        row: rowNumber,
        email: normalized.email,
        message: err.message || 'Failed to create supplier',
      });
    }
  }

  return {
    total: rows.length,
    createdCount: created.length,
    failedCount: failed.length,
    created,
    failed,
  };
}

module.exports = { listSuppliers, createSupplier, bulkCreateSuppliers };
