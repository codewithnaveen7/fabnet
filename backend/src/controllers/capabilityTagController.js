const capabilityTagService = require('../services/capabilityTagService');

async function listTags(_req, res) {
  const tags = await capabilityTagService.listTags();
  res.json({ success: true, data: tags });
}

module.exports = { listTags };
