const prisma = require('../lib/prisma');

async function listTags() {
  return prisma.capabilityTag.findMany({
    orderBy: { name: 'asc' },
  });
}

/** Find-or-create tags by name; returns tag ids in stable order. */
async function resolveTagIdsByNames(names = []) {
  const cleaned = [
    ...new Set(
      names
        .map((n) => String(n || '').trim())
        .filter((n) => n.length > 0)
        .map((n) => n.slice(0, 255))
    ),
  ];
  if (!cleaned.length) return [];

  const ids = [];
  for (const name of cleaned) {
    const tag = await prisma.capabilityTag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    ids.push(tag.id);
  }
  return ids;
}

module.exports = {
  listTags,
  resolveTagIdsByNames,
};
