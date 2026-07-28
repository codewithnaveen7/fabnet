const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const { buildObjectKey, uploadObject, deleteObject, getPresignedGetUrl } = require('../lib/s3');
const {
  assertActiveServiceIds,
  resolveServiceIdsByNames,
} = require('./serviceService');

const rfqDetailSelect = {
  id: true,
  rfqNumber: true,
  title: true,
  requestedById: true,
  clientProjectName: true,
  dateCreated: true,
  quoteDueDate: true,
  requiredDeliveryDate: true,
  partName: true,
  partNumber: true,
  revisionLevel: true,
  materialSpecification: true,
  quantity: true,
  unitOfMeasure: true,
  specialProcesses: true,
  toleranceNotes: true,
  requiredCertifications: true,
  itarExportControl: true,
  countryOfOriginRestriction: true,
  incoterms: true,
  targetBudgetaryPrice: true,
  paymentTerms: true,
  currency: true,
  quotesRequired: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  requestedBy: { select: { id: true, name: true, email: true } },
  processServices: {
    select: {
      serviceId: true,
      service: { select: { id: true, name: true } },
    },
  },
  documents: {
    select: {
      id: true,
      fileName: true,
      fileKey: true,
      mimeType: true,
      fileSize: true,
      uploadedAt: true,
    },
  },
  invites: {
    select: {
      id: true,
      supplierId: true,
      included: true,
      supplier: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          itarRegistered: true,
          user: { select: { email: true, status: true } },
        },
      },
    },
  },
};

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v || '').trim()).filter(Boolean))];
}

function fieldFiles(files, field) {
  const list = files?.[field];
  if (Array.isArray(list)) return list.filter(Boolean);
  return list ? [list] : [];
}

async function nextRfqNumber(tx) {
  const year = new Date().getFullYear();
  const prefix = `RFQ-${year}-`;
  const latest = await tx.rfq.findFirst({
    where: { rfqNumber: { startsWith: prefix } },
    orderBy: { rfqNumber: 'desc' },
    select: { rfqNumber: true },
  });
  let seq = 1;
  if (latest?.rfqNumber) {
    const n = Number(latest.rfqNumber.slice(prefix.length));
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

async function resolveProcessServiceIds({
  processServiceIds,
  processServiceNames,
  processTagIds,
  processTagNames,
}) {
  // processTagIds kept as alias so older clients keep working during transition
  let serviceIds = [
    ...(Array.isArray(processServiceIds) ? processServiceIds : []),
    ...(Array.isArray(processTagIds) ? processTagIds : []),
  ].filter(Boolean);

  const names = [
    ...(Array.isArray(processServiceNames) ? processServiceNames : []),
    ...(Array.isArray(processTagNames) ? processTagNames : []),
  ];
  if (names.length) {
    serviceIds = [...new Set([...serviceIds, ...(await resolveServiceIdsByNames(names))])];
  }
  return assertActiveServiceIds(serviceIds);
}

async function syncRfqProcessServices(tx, rfqId, serviceIds) {
  await tx.rfqProcessService.deleteMany({ where: { rfqId } });
  if (serviceIds.length) {
    await tx.rfqProcessService.createMany({
      data: serviceIds.map((serviceId) => ({ rfqId, serviceId })),
    });
  }
}

async function syncInvites(tx, rfqId, invites = []) {
  await tx.rfqInvite.deleteMany({ where: { rfqId } });
  const rows = [];
  const seen = new Set();
  for (const invite of invites) {
    const supplierId = invite?.supplierId;
    if (!supplierId || seen.has(supplierId)) continue;
    seen.add(supplierId);
    rows.push({
      rfqId,
      supplierId,
      included: invite.included !== false,
    });
  }
  if (rows.length) {
    const profiles = await tx.supplierProfile.findMany({
      where: { id: { in: rows.map((r) => r.supplierId) } },
      select: { id: true },
    });
    const valid = new Set(profiles.map((p) => p.id));
    const data = rows.filter((r) => valid.has(r.supplierId));
    if (data.length) await tx.rfqInvite.createMany({ data });
  }
}

async function removeDocumentsByIds(tx, rfqId, ids = []) {
  const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))];
  if (!uniqueIds.length) return;
  const docs = await tx.rfqDocument.findMany({
    where: { rfqId, id: { in: uniqueIds } },
  });
  for (const doc of docs) {
    if (doc.fileKey) {
      try {
        await deleteObject(doc.fileKey);
      } catch {
        // continue
      }
    }
    await tx.rfqDocument.delete({ where: { id: doc.id } });
  }
}

async function appendDrawingFiles(tx, rfqId, fileList = []) {
  for (const file of fileList) {
    if (!file) continue;
    const key = buildObjectKey(rfqId, 'rfq', 'DRAWING', file.originalname);
    await uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    await tx.rfqDocument.create({
      data: {
        rfqId,
        fileName: file.originalname,
        fileKey: key,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });
  }
}

function parseDateOnly(value, field) {
  if (!value) throw ApiError.badRequest(`${field} is required`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest(`Invalid ${field}`);
  return d;
}

async function listRfqs() {
  return prisma.rfq.findMany({
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      clientProjectName: true,
      quoteDueDate: true,
      requiredDeliveryDate: true,
      status: true,
      itarExportControl: true,
      currency: true,
      dateCreated: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      _count: { select: { invites: true, documents: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRfqById(id) {
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    select: rfqDetailSelect,
  });
  if (!rfq) throw ApiError.notFound('RFQ not found');
  return rfq;
}

function mapSuggestedSuppliers(suppliers) {
  return suppliers.map((s) => ({
    supplierId: s.id,
    companyName: s.companyName,
    contactPerson: s.contactPerson,
    email: s.user?.email,
    itarRegistered: s.itarRegistered,
    countryOfRegistration: s.countryOfRegistration,
    services: (s.services || []).map((row) => row.service).filter(Boolean),
  }));
}

const suggestSupplierSelect = {
  id: true,
  companyName: true,
  contactPerson: true,
  itarRegistered: true,
  countryOfRegistration: true,
  user: { select: { email: true, status: true } },
  services: {
    select: { serviceId: true, service: { select: { id: true, name: true } } },
  },
};

/**
 * Returns all inviteable suppliers as options, plus suggestedIds that should
 * be auto-selected from matching supplier services (process category).
 */
async function suggestSuppliers({
  processServiceIds = [],
  processTagIds = [],
  itarExportControl = false,
} = {}) {
  const serviceIds = [
    ...new Set(
      [...(processServiceIds || []), ...(processTagIds || [])].filter(Boolean)
    ),
  ];

  const baseWhere = {
    status: 'ACTIVE',
    user: { status: 'ACTIVE', role: 'SUPPLIER' },
  };
  if (itarExportControl) {
    baseWhere.itarRegistered = true;
  }

  const all = await prisma.supplierProfile.findMany({
    where: baseWhere,
    select: suggestSupplierSelect,
    orderBy: { companyName: 'asc' },
    take: 500,
  });

  const options = mapSuggestedSuppliers(all);
  let suggestedIds = [];

  if (serviceIds.length) {
    const matched = await prisma.supplierProfile.findMany({
      where: {
        ...baseWhere,
        services: { some: { serviceId: { in: serviceIds } } },
      },
      select: { id: true },
      take: 500,
    });
    suggestedIds = matched.map((s) => s.id);
  }

  return { options, suggestedIds };
}

async function createRfq(payload, files = {}, requestedById) {
  if (!requestedById) throw ApiError.unauthorized('Authentication required');

  const {
    title,
    clientProjectName,
    quoteDueDate,
    requiredDeliveryDate,
    partName,
    partNumber,
    revisionLevel,
    materialSpecification,
    quantity,
    unitOfMeasure,
    specialProcesses,
    toleranceNotes,
    requiredCertifications,
    itarExportControl,
    countryOfOriginRestriction,
    incoterms,
    targetBudgetaryPrice,
    paymentTerms,
    currency,
    quotesRequired,
    processServiceIds,
    processServiceNames,
    processTagIds,
    processTagNames,
    invites = [],
  } = payload;

  if (!title?.trim()) throw ApiError.badRequest('Title is required');
  if (!clientProjectName?.trim()) throw ApiError.badRequest('Client / project name is required');
  if (!partName?.trim()) throw ApiError.badRequest('Part / assembly name is required');
  if (!partNumber?.trim()) throw ApiError.badRequest('Part number is required');
  if (quantity == null || quantity === '') throw ApiError.badRequest('Quantity is required');
  if (!unitOfMeasure?.trim()) throw ApiError.badRequest('Unit of measure is required');
  if (!incoterms?.trim()) throw ApiError.badRequest('Incoterms is required');
  if (!currency?.trim()) throw ApiError.badRequest('Currency is required');
  if (typeof itarExportControl !== 'boolean') {
    throw ApiError.badRequest('ITAR / export control flag is required');
  }

  const serviceIds = await resolveProcessServiceIds({
    processServiceIds,
    processServiceNames,
    processTagIds,
    processTagNames,
  });

  const drawings = fieldFiles(files, 'drawings');
  const rfqId = await prisma.$transaction(async (tx) => {
    const rfqNumber = await nextRfqNumber(tx);
    const rfq = await tx.rfq.create({
      data: {
        rfqNumber,
        title: title.trim(),
        requestedById,
        clientProjectName: clientProjectName.trim(),
        quoteDueDate: parseDateOnly(quoteDueDate, 'quoteDueDate'),
        requiredDeliveryDate: parseDateOnly(requiredDeliveryDate, 'requiredDeliveryDate'),
        partName: partName.trim(),
        partNumber: partNumber.trim(),
        revisionLevel: revisionLevel?.trim() || null,
        materialSpecification: materialSpecification?.trim() || null,
        quantity,
        unitOfMeasure: unitOfMeasure.trim(),
        specialProcesses: asStringArray(specialProcesses),
        toleranceNotes: toleranceNotes?.trim() || null,
        requiredCertifications: asStringArray(requiredCertifications),
        itarExportControl: Boolean(itarExportControl),
        countryOfOriginRestriction: countryOfOriginRestriction?.trim() || null,
        incoterms: incoterms.trim(),
        targetBudgetaryPrice:
          targetBudgetaryPrice === '' || targetBudgetaryPrice == null
            ? null
            : targetBudgetaryPrice,
        paymentTerms: paymentTerms?.trim() || null,
        currency: currency.trim().toUpperCase(),
        quotesRequired:
          quotesRequired === '' || quotesRequired == null ? null : Number(quotesRequired),
        status: 'DRAFT',
      },
    });

    await syncRfqProcessServices(tx, rfq.id, serviceIds);
    await syncInvites(tx, rfq.id, invites);
    return rfq.id;
  });

  if (drawings.length) {
    await prisma.$transaction(async (tx) => {
      await appendDrawingFiles(tx, rfqId, drawings);
    });
  }

  return getRfqById(rfqId);
}

async function updateRfq(id, payload, files = {}) {
  const existing = await getRfqById(id);
  const {
    title,
    clientProjectName,
    quoteDueDate,
    requiredDeliveryDate,
    partName,
    partNumber,
    revisionLevel,
    materialSpecification,
    quantity,
    unitOfMeasure,
    specialProcesses,
    toleranceNotes,
    requiredCertifications,
    itarExportControl,
    countryOfOriginRestriction,
    incoterms,
    targetBudgetaryPrice,
    paymentTerms,
    currency,
    quotesRequired,
    processServiceIds,
    processServiceNames,
    processTagIds,
    processTagNames,
    invites,
    removeDocumentIds = [],
    status,
  } = payload;

  const serviceIds = await resolveProcessServiceIds({
    processServiceIds,
    processServiceNames,
    processTagIds,
    processTagNames,
  });

  const drawings = fieldFiles(files, 'drawings');

  await prisma.$transaction(async (tx) => {
    await tx.rfq.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        clientProjectName: clientProjectName?.trim() || existing.clientProjectName,
        quoteDueDate: quoteDueDate
          ? parseDateOnly(quoteDueDate, 'quoteDueDate')
          : existing.quoteDueDate,
        requiredDeliveryDate: requiredDeliveryDate
          ? parseDateOnly(requiredDeliveryDate, 'requiredDeliveryDate')
          : existing.requiredDeliveryDate,
        partName: partName?.trim() || existing.partName,
        partNumber: partNumber?.trim() || existing.partNumber,
        revisionLevel:
          revisionLevel === undefined
            ? existing.revisionLevel
            : revisionLevel?.trim() || null,
        materialSpecification:
          materialSpecification === undefined
            ? existing.materialSpecification
            : materialSpecification?.trim() || null,
        quantity: quantity ?? existing.quantity,
        unitOfMeasure: unitOfMeasure?.trim() || existing.unitOfMeasure,
        specialProcesses:
          specialProcesses === undefined
            ? existing.specialProcesses
            : asStringArray(specialProcesses),
        toleranceNotes:
          toleranceNotes === undefined
            ? existing.toleranceNotes
            : toleranceNotes?.trim() || null,
        requiredCertifications:
          requiredCertifications === undefined
            ? existing.requiredCertifications
            : asStringArray(requiredCertifications),
        itarExportControl:
          typeof itarExportControl === 'boolean'
            ? itarExportControl
            : existing.itarExportControl,
        countryOfOriginRestriction:
          countryOfOriginRestriction === undefined
            ? existing.countryOfOriginRestriction
            : countryOfOriginRestriction?.trim() || null,
        incoterms: incoterms?.trim() || existing.incoterms,
        targetBudgetaryPrice:
          targetBudgetaryPrice === undefined
            ? existing.targetBudgetaryPrice
            : targetBudgetaryPrice === '' || targetBudgetaryPrice == null
              ? null
              : targetBudgetaryPrice,
        paymentTerms:
          paymentTerms === undefined ? existing.paymentTerms : paymentTerms?.trim() || null,
        currency: currency?.trim()?.toUpperCase() || existing.currency,
        quotesRequired:
          quotesRequired === undefined
            ? existing.quotesRequired
            : quotesRequired === '' || quotesRequired == null
              ? null
              : Number(quotesRequired),
        ...(status ? { status } : {}),
      },
    });

    await syncRfqProcessServices(tx, id, serviceIds);
    if (Array.isArray(invites)) {
      await syncInvites(tx, id, invites);
    }
    await removeDocumentsByIds(tx, id, removeDocumentIds);
    await appendDrawingFiles(tx, id, drawings);
  });

  return getRfqById(id);
}

async function getFileDownloadUrl({ rfqId, id }) {
  const doc = await prisma.rfqDocument.findFirst({
    where: { id, rfqId },
  });
  if (!doc?.fileKey) throw ApiError.notFound('File not found');
  return getPresignedGetUrl(doc.fileKey);
}

async function deleteRfq(id) {
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    select: {
      id: true,
      documents: { select: { id: true, fileKey: true } },
    },
  });
  if (!rfq) throw ApiError.notFound('RFQ not found');

  for (const doc of rfq.documents) {
    if (doc.fileKey) {
      try {
        await deleteObject(doc.fileKey);
      } catch {
        // continue deleting DB row even if object storage cleanup fails
      }
    }
  }

  await prisma.rfq.delete({ where: { id } });
  return { id };
}

module.exports = {
  listRfqs,
  getRfqById,
  createRfq,
  updateRfq,
  deleteRfq,
  suggestSuppliers,
  getFileDownloadUrl,
  nextRfqNumber,
};
