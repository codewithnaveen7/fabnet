const supplierService = require('../services/supplierService');

async function listSuppliers(_req, res) {
  const suppliers = await supplierService.listSuppliers();
  res.json({ success: true, data: suppliers });
}

async function createSupplier(req, res) {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ success: true, data: supplier });
}

module.exports = { listSuppliers, createSupplier };
