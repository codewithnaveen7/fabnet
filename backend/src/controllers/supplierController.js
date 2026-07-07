const supplierService = require('../services/supplierService');
const { getCsvTemplate } = require('../utils/supplierCsv');

async function listSuppliers(_req, res) {
  const suppliers = await supplierService.listSuppliers();
  res.json({ success: true, data: suppliers });
}

async function createSupplier(req, res) {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ success: true, data: supplier });
}

async function bulkCreateSuppliers(req, res) {
  const result = await supplierService.bulkCreateSuppliers(req.body.suppliers);
  res.status(201).json({ success: true, data: result });
}

function downloadTemplate(_req, res) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="suppliers-template.csv"');
  res.send(getCsvTemplate());
}

module.exports = {
  listSuppliers,
  createSupplier,
  bulkCreateSuppliers,
  downloadTemplate,
};
