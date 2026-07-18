const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { supplierUploadFields, parseSupplierPayload } = require('../middleware/upload');

const router = express.Router();

const uuidMsg = 'Each service must be a valid UUID';

const createValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').optional({ nullable: true }).trim(),
  body('companyName').trim().notEmpty(),
  body('contactPerson').trim().notEmpty(),
  body('address').optional({ nullable: true }).trim(),
  body('tradeLicenseNumber').optional({ nullable: true }).trim(),
  body('countryOfRegistration').optional({ nullable: true }).trim(),
  body('websiteUrl').optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: false }),
  body('comments').optional({ nullable: true }).trim(),
  body('services').optional().isArray(),
  body('services.*').optional().isUUID().withMessage(uuidMsg),
  body('itarRegistered').optional().isBoolean().toBoolean(),
  body('capabilityTags').optional().isArray(),
  body('capabilityTags.*').optional().isString().trim(),
  body('certifications').optional().isArray(),
];

const updateValidators = [
  body('id').notEmpty(),
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8 }),
  body('phone').optional({ nullable: true }).trim(),
  body('companyName').trim().notEmpty(),
  body('contactPerson').trim().notEmpty(),
  body('address').optional({ nullable: true }).trim(),
  body('tradeLicenseNumber').optional({ nullable: true }).trim(),
  body('countryOfRegistration').optional({ nullable: true }).trim(),
  body('websiteUrl').optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: false }),
  body('comments').optional({ nullable: true }).trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  body('services').optional().isArray(),
  body('services.*').optional().isUUID().withMessage(uuidMsg),
  body('itarRegistered').optional().isBoolean().toBoolean(),
  body('capabilityTags').optional().isArray(),
  body('capabilityTags.*').optional().isString().trim(),
  body('certifications').optional().isArray(),
  body('removeDocumentIds').optional().isArray(),
  body('removeDocumentIds.*').optional().isUUID(),
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
  body('suppliers.*.services.*').optional().isString(),
];

router.use(authenticate, requireRole('ADMIN'));

router.get('/', parseEventBody, asyncHandler(supplierController.listSuppliers));
router.post('/', parseEventBody, asyncHandler(supplierController.listSuppliers));
router.get('/template', asyncHandler(supplierController.downloadTemplate));
router.post(
  '/get',
  parseEventBody,
  [body('id').notEmpty()],
  validate,
  asyncHandler(supplierController.getSupplier)
);
router.post(
  '/create',
  (req, res, next) => {
    if (req.is('multipart/form-data')) {
      return supplierUploadFields(req, res, (err) => {
        if (err) return next(err);
        return parseSupplierPayload(req, res, next);
      });
    }
    return parseEventBody(req, res, next);
  },
  createValidators,
  validate,
  asyncHandler(supplierController.createSupplier)
);
router.post(
  '/update',
  (req, res, next) => {
    if (req.is('multipart/form-data')) {
      return supplierUploadFields(req, res, (err) => {
        if (err) return next(err);
        return parseSupplierPayload(req, res, next);
      });
    }
    return parseEventBody(req, res, next);
  },
  updateValidators,
  validate,
  asyncHandler(supplierController.updateSupplier)
);
router.post(
  '/delete',
  parseEventBody,
  [body('id').notEmpty()],
  validate,
  asyncHandler(supplierController.deleteSupplier)
);
router.post(
  '/bulk',
  parseEventBody,
  bulkValidators,
  validate,
  asyncHandler(supplierController.bulkCreateSuppliers)
);
router.post(
  '/file-url',
  parseEventBody,
  [
    body('supplierId').notEmpty(),
    body('kind').isIn(['cert', 'doc']),
    body('id').notEmpty(),
  ],
  validate,
  asyncHandler(supplierController.getFileUrl)
);

module.exports = router;
