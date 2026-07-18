const serviceService = require('../services/serviceService');

async function listServices(req, res) {
  const status = req.body?.status || req.query?.status;
  const services = await serviceService.listServices({ status: status || undefined });
  res.json({ success: true, data: services });
}

async function getService(req, res) {
  const service = await serviceService.getServiceById(req.body.id);
  res.json({ success: true, data: service });
}

async function createService(req, res) {
  const service = await serviceService.createService(req.body);
  res.status(201).json({ success: true, data: service });
}

async function updateService(req, res) {
  const { id, ...payload } = req.body;
  const service = await serviceService.updateService(id, payload);
  res.json({ success: true, data: service });
}

async function deleteService(req, res) {
  const result = await serviceService.deleteService(req.body.id);
  res.json({ success: true, data: result });
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
};
