const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');

async function listServices({ status } = {}) {
  const where = {};
  if (status) where.status = status;
  return prisma.service.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

async function getServiceById(id) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw ApiError.notFound('Service not found');
  return service;
}

async function createService({ name, description, status = 'ACTIVE' }) {
  const trimmed = name?.trim();
  if (!trimmed) throw ApiError.badRequest('Name is required');

  const existing = await prisma.service.findUnique({ where: { name: trimmed } });
  if (existing) throw ApiError.conflict('A service with this name already exists');

  return prisma.service.create({
    data: {
      name: trimmed,
      description: description?.trim() || null,
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    },
  });
}

async function updateService(id, { name, description, status }) {
  await getServiceById(id);
  const data = {};
  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) throw ApiError.badRequest('Name is required');
    const existing = await prisma.service.findFirst({
      where: { name: trimmed, NOT: { id } },
    });
    if (existing) throw ApiError.conflict('A service with this name already exists');
    data.name = trimmed;
  }
  if (description !== undefined) data.description = description?.trim() || null;
  if (status !== undefined) data.status = status;

  return prisma.service.update({ where: { id }, data });
}

async function deleteService(id) {
  await getServiceById(id);
  const linked = await prisma.supplierService.count({ where: { serviceId: id } });
  if (linked > 0) {
    return prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
  await prisma.service.delete({ where: { id } });
  return { message: 'Service deleted successfully', deleted: true };
}

async function assertActiveServiceIds(serviceIds = []) {
  if (!serviceIds.length) return [];
  const unique = [...new Set(serviceIds)];
  const found = await prisma.service.findMany({
    where: { id: { in: unique }, status: 'ACTIVE' },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    throw ApiError.badRequest('One or more services are invalid or inactive');
  }
  return unique;
}

async function resolveServiceIdsByNames(names = []) {
  if (!names.length) return [];
  const normalized = names.map((n) => String(n).trim()).filter(Boolean);
  if (!normalized.length) return [];

  const services = await prisma.service.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true },
  });

  const byLower = new Map(services.map((s) => [s.name.toLowerCase(), s.id]));
  const ids = [];
  for (const name of normalized) {
    const id = byLower.get(name.toLowerCase());
    if (id) ids.push(id);
  }
  return [...new Set(ids)];
}

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  assertActiveServiceIds,
  resolveServiceIdsByNames,
};
