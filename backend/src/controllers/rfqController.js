const rfqService = require('../services/rfqService');

async function listRfqs(req, res) {
  const rfqs = await rfqService.listRfqs(req.user);
  res.json({ success: true, data: rfqs });
}

async function getRfq(req, res) {
  const rfq = await rfqService.getRfqById(req.body.id, req.user);
  res.json({ success: true, data: rfq });
}

async function createRfq(req, res) {
  const rfq = await rfqService.createRfq(req.body, req.files || {}, req.user.id);
  res.status(201).json({ success: true, data: rfq });
}

async function updateRfq(req, res) {
  const { id, ...payload } = req.body;
  const rfq = await rfqService.updateRfq(id, payload, req.files || {});
  res.json({ success: true, data: rfq });
}

async function suggestSuppliers(req, res) {
  const suppliers = await rfqService.suggestSuppliers(req.body);
  res.json({ success: true, data: suppliers });
}

async function getFileUrl(req, res) {
  const result = await rfqService.getFileDownloadUrl(req.body, req.user);
  res.json({ success: true, data: result });
}

async function deleteRfq(req, res) {
  const result = await rfqService.deleteRfq(req.body.id);
  res.json({ success: true, data: result });
}

async function upsertQuote(req, res) {
  const quote = await rfqService.upsertQuote(req.body, req.user);
  res.json({ success: true, data: quote });
}

async function setAward(req, res) {
  const award = await rfqService.setAward(req.body, req.user);
  res.json({ success: true, data: award });
}

module.exports = {
  listRfqs,
  getRfq,
  createRfq,
  updateRfq,
  deleteRfq,
  suggestSuppliers,
  getFileUrl,
  upsertQuote,
  setAward,
};
