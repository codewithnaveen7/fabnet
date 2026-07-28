const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { assertActiveServiceIds, resolveServiceIdsByNames } = require('./serviceService');
const { buildObjectKey, uploadObject, deleteObject, getPresignedGetUrl } = require('../lib/s3');

const CERT_TYPES = ['AS9100', 'ISO9001'];

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
      tradeLicenseNumber: true,
      countryOfRegistration: true,
      websiteUrl: true,
      comments: true,
      itarRegistered: true,
      status: true,
      services: {
        select: {
          serviceId: true,
          service: { select: { id: true, name: true, status: true } },
        },
      },
      certifications: {
        select: {
          id: true,
          type: true,
          certified: true,
          expiryDate: true,
          fileName: true,
          fileKey: true,
          mimeType: true,
          fileSize: true,
        },
      },
      documents: {
        select: {
          id: true,
          docType: true,
          fileName: true,
          fileKey: true,
          mimeType: true,
          fileSize: true,
          uploadedAt: true,
        },
      },
    },
  },
};

function firstFile(files, field) {
  const list = files?.[field];
  return Array.isArray(list) && list.length ? list[0] : null;
}

function fieldFiles(files, field) {
  const list = files?.[field];
  if (Array.isArray(list)) return list.filter(Boolean);
  return list ? [list] : [];
}

async function syncServices(tx, profileId, serviceIds) {
  const ids = await assertActiveServiceIds(serviceIds);
  await tx.supplierService.deleteMany({ where: { supplierId: profileId } });
  if (ids.length) {
    await tx.supplierService.createMany({
      data: ids.map((serviceId) => ({ supplierId: profileId, serviceId })),
    });
  }
}

async function uploadCertFile(supplierId, type, file) {
  if (!file) return null;
  const key = buildObjectKey(supplierId, 'cert', type, file.originalname);
  await uploadObject({
    key,
    body: file.buffer,
    contentType: file.mimetype,
  });
  return {
    fileName: file.originalname,
    fileKey: key,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
}

async function syncCertifications(tx, profileId, certifications = [], files = {}) {
  const byType = new Map();
  for (const item of certifications) {
    if (!item?.type || !CERT_TYPES.includes(item.type)) continue;
    byType.set(item.type, item);
  }

  for (const type of CERT_TYPES) {
    const item = byType.get(type) || { type, certified: false };
    const certified = Boolean(item.certified);
    const expiryDate = certified && item.expiryDate ? new Date(item.expiryDate) : null;
    const file = firstFile(files, `cert_${type}`);

    const existing = await tx.supplierCertification.findUnique({
      where: { supplierId_type: { supplierId: profileId, type } },
    });

    let fileMeta = {};
    if (!certified) {
      if (existing?.fileKey) await deleteObject(existing.fileKey);
      fileMeta = { fileName: null, fileKey: null, mimeType: null, fileSize: null };
    } else if (file) {
      if (existing?.fileKey) await deleteObject(existing.fileKey);
      fileMeta = await uploadCertFile(profileId, type, file);
    }

    const data = {
      certified,
      expiryDate: certified ? expiryDate : null,
      ...fileMeta,
    };

    if (existing) {
      await tx.supplierCertification.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await tx.supplierCertification.create({
        data: {
          supplierId: profileId,
          type,
          ...data,
        },
      });
    }
  }
}

async function removeDocumentsByIds(tx, profileId, ids = []) {
  const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))];
  if (!uniqueIds.length) return;

  const docs = await tx.supplierDocument.findMany({
    where: { supplierId: profileId, id: { in: uniqueIds } },
  });
  for (const doc of docs) {
    if (doc.fileKey) {
      try {
        await deleteObject(doc.fileKey);
      } catch {
        // Continue removing DB row even if S3 object is already gone
      }
    }
    await tx.supplierDocument.delete({ where: { id: doc.id } });
  }
}

async function appendDocumentFiles(tx, profileId, docType, fileList = []) {
  for (const file of fileList) {
    if (!file) continue;
    const key = buildObjectKey(profileId, 'doc', docType, file.originalname);
    await uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    await tx.supplierDocument.create({
      data: {
        supplierId: profileId,
        docType,
        fileName: file.originalname,
        fileKey: key,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });
  }
}

async function syncDocuments(tx, profileId, files = {}, { removeDocumentIds = [] } = {}) {
  await removeDocumentsByIds(tx, profileId, removeDocumentIds);
  await appendDocumentFiles(tx, profileId, 'CAPABILITY_PROFILE', fieldFiles(files, 'capabilityProfile'));
  await appendDocumentFiles(tx, profileId, 'BROCHURE', fieldFiles(files, 'brochures'));
}

async function listSuppliers() {
  return prisma.user.findMany({
    where: { role: 'SUPPLIER' },
    select: supplierListSelect,
    orderBy: { createdAt: 'desc' },
  });
}

async function createSupplier(payload, files = {}) {
  const {
    name,
    email,
    password,
    phone,
    companyName,
    contactPerson,
    address,
    tradeLicenseNumber,
    countryOfRegistration,
    websiteUrl,
    comments,
    services = [],
    itarRegistered = false,
    certifications = [],
  } = payload;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email is already in use');
  }

  await assertActiveServiceIds(services);
  const hashedPassword = await hashPassword(password);

  const userId = await prisma.$transaction(async (tx) => {
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
        tradeLicenseNumber: tradeLicenseNumber || null,
        countryOfRegistration: countryOfRegistration || null,
        websiteUrl: websiteUrl || null,
        comments: comments || null,
        itarRegistered: Boolean(itarRegistered),
        status: 'ACTIVE',
      },
    });

    await syncServices(tx, profile.id, services);
    return { userId: user.id, profileId: profile.id };
  });

  // Files / certs after profile exists (S3 needs profile id)
  await prisma.$transaction(async (tx) => {
    await syncCertifications(tx, userId.profileId, certifications, files);
    await syncDocuments(tx, userId.profileId, files);
  });

  return prisma.user.findUnique({
    where: { id: userId.userId },
    select: supplierListSelect,
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
      // CSV services are names; resolve to IDs
      const serviceIds = await resolveServiceIdsByNames(normalized.services);
      const supplier = await createSupplier({ ...normalized, services: serviceIds });
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

async function getSupplierById(id) {
  const supplier = await prisma.user.findFirst({
    where: { id, role: 'SUPPLIER' },
    select: supplierListSelect,
  });
  if (!supplier) {
    throw ApiError.notFound('Supplier not found');
  }
  return supplier;
}

async function updateSupplier(id, payload, files = {}) {
  const {
    name,
    email,
    password,
    phone,
    companyName,
    contactPerson,
    address,
    tradeLicenseNumber,
    countryOfRegistration,
    websiteUrl,
    comments,
    services = [],
    status,
    itarRegistered,
    certifications = [],
    removeDocumentIds = [],
  } = payload;

  const supplier = await getSupplierById(id);

  if (email && email !== supplier.email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (existing) {
      throw ApiError.conflict('Email is already in use');
    }
  }

  await assertActiveServiceIds(services);

  const userData = {
    name,
    email,
    phone: phone || null,
  };
  if (status) userData.status = status;
  if (password?.trim()) {
    userData.password = await hashPassword(password);
  }

  const profileId = supplier.supplierProfile.id;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: userData,
    });

    await tx.supplierProfile.update({
      where: { userId: id },
      data: {
        companyName,
        contactPerson,
        phone: phone || null,
        address: address || null,
        tradeLicenseNumber: tradeLicenseNumber || null,
        countryOfRegistration: countryOfRegistration || null,
        websiteUrl: websiteUrl || null,
        comments: comments || null,
        ...(itarRegistered !== undefined ? { itarRegistered: Boolean(itarRegistered) } : {}),
        ...(status ? { status } : {}),
      },
    });

    await syncServices(tx, profileId, services);
    await syncCertifications(tx, profileId, certifications, files);
    await syncDocuments(tx, profileId, files, { removeDocumentIds });
  });

  return prisma.user.findUnique({
    where: { id },
    select: supplierListSelect,
  });
}

async function deleteSupplier(id) {
  const supplier = await getSupplierById(id);
  const profile = supplier.supplierProfile;
  if (profile) {
    for (const cert of profile.certifications || []) {
      if (cert.fileKey) await deleteObject(cert.fileKey);
    }
    for (const doc of profile.documents || []) {
      if (doc.fileKey) await deleteObject(doc.fileKey);
    }
  }
  await prisma.user.delete({ where: { id } });
  return { message: 'Supplier deleted successfully' };
}

async function getFileDownloadUrl({ supplierId, kind, id }) {
  const supplier = await getSupplierById(supplierId);
  const profile = supplier.supplierProfile;
  if (!profile) throw ApiError.notFound('Supplier profile not found');

  let fileKey;
  let fileName;
  if (kind === 'cert') {
    const cert = (profile.certifications || []).find((c) => c.id === id);
    if (!cert?.fileKey) throw ApiError.notFound('Certificate file not found');
    fileKey = cert.fileKey;
    fileName = cert.fileName;
  } else if (kind === 'doc') {
    const doc = (profile.documents || []).find((d) => d.id === id);
    if (!doc?.fileKey) throw ApiError.notFound('Document file not found');
    fileKey = doc.fileKey;
    fileName = doc.fileName;
  } else {
    throw ApiError.badRequest('kind must be cert or doc');
  }

  const { url, expiresIn } = await getPresignedGetUrl(fileKey);
  return { url, expiresIn, fileName };
}

module.exports = {
  listSuppliers,
  createSupplier,
  bulkCreateSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getFileDownloadUrl,
};
