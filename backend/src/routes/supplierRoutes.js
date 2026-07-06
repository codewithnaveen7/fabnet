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

router.use(parseEventBody);
router.use(authenticate, requireRole('ADMIN'));

router.get('/', asyncHandler(supplierController.listSuppliers));
router.post('/', asyncHandler(supplierController.listSuppliers));
router.post(
  '/create',
  createValidators,
  validate,
  asyncHandler(supplierController.createSupplier),
);

module.exports = router;
