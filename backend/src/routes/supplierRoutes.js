const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const SERVICE_TYPES = [
  'DESIGN',
  'MANUFACTURING',
  'INSPECTION',
  'LOGISTICS',
  'PACKAGING',
  'CERTIFICATION',
];

const createValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').optional().trim(),
  body('companyName').trim().notEmpty(),
  body('contactPerson').trim().notEmpty(),
  body('address').optional().trim(),
  body('services').optional().isArray(),
  body('services.*').optional().isIn(SERVICE_TYPES),
];

const updateValidators = [
  body('id').notEmpty(),
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 8 }),
  body('phone').optional().trim(),
  body('companyName').trim().notEmpty(),
  body('contactPerson').trim().notEmpty(),
  body('address').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  body('services').optional().isArray(),
  body('services.*').optional().isIn(SERVICE_TYPES),
];

const bulkValidators = [
  body('suppliers').isArray({ min: 1, max: 100 }),
  body('suppliers.*.name').optional().trim(),
  body('suppliers.*.email').optional().trim(),
  body('suppliers.*.password').optional().trim(),
  body('suppliers.*.phone').optional().trim(),
  body('suppliers.*.companyName').optional().trim(),
  body('suppliers.*.contactPerson').optional().trim(),
  body('suppliers.*.address').optional().trim(),
  body('suppliers.*.services').optional().isArray(),
  body('suppliers.*.services.*').optional().isIn(SERVICE_TYPES),
];

router.use(parseEventBody);
router.use(authenticate, requireRole('ADMIN'));

router.get('/', asyncHandler(supplierController.listSuppliers));
router.post('/', asyncHandler(supplierController.listSuppliers));
router.get('/template', asyncHandler(supplierController.downloadTemplate));
router.post('/get', [body('id').notEmpty()], validate, asyncHandler(supplierController.getSupplier));
router.post(
  '/create',
  createValidators,
  validate,
  asyncHandler(supplierController.createSupplier),
);
router.post(
  '/update',
  updateValidators,
  validate,
  asyncHandler(supplierController.updateSupplier),
);
router.post('/delete', [body('id').notEmpty()], validate, asyncHandler(supplierController.deleteSupplier));
router.post(
  '/bulk',
  bulkValidators,
  validate,
  asyncHandler(supplierController.bulkCreateSuppliers),
);

module.exports = router;
