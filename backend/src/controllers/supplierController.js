const supplierService = require('../services/supplierService');
const { getCsvTemplate } = require('../utils/supplierCsv');

async function listSuppliers(_req, res) {
  const suppliers = await supplierService.listSuppliers();
  res.json({ success: true, data: suppliers });
}

async function getSupplier(req, res) {
  const id = req.body.id || req.params.id;
  const supplier = await supplierService.getSupplierById(id);
  res.json({ success: true, data: supplier });
}

async function createSupplier(req, res) {
  const supplier = await supplierService.createSupplier(req.body, req.files || {});
  res.status(201).json({ success: true, data: supplier });
}

async function updateSupplier(req, res) {
  const { id, ...payload } = req.body;
  const supplier = await supplierService.updateSupplier(id, payload, req.files || {});
  res.json({ success: true, data: supplier });
}

async function deleteSupplier(req, res) {
  const id = req.body.id || req.params.id;
  const result = await supplierService.deleteSupplier(id);
  res.json({ success: true, data: result });
}

async function bulkCreateSuppliers(req, res) {
  const result = await supplierService.bulkCreateSuppliers(req.body.suppliers);
  res.status(201).json({ success: true, data: result });
}

async function getFileUrl(req, res) {
  const result = await supplierService.getFileDownloadUrl(req.body);
  res.json({ success: true, data: result });
}

function downloadTemplate(_req, res) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="suppliers-template.csv"');
  res.send(getCsvTemplate());
}

module.exports = {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  bulkCreateSuppliers,
  downloadTemplate,
  getFileUrl,
};
