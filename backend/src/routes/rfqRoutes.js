const express = require('express');
const { body } = require('express-validator');
const rfqController = require('../controllers/rfqController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { rfqUploadFields, parseRfqPayload } = require('../middleware/upload');

const router = express.Router();

function multipartOrJson(req, res, next) {
  if (req.is('multipart/form-data')) {
    return rfqUploadFields(req, res, (err) => {
      if (err) return next(err);
      return parseRfqPayload(req, res, next);
    });
  }
  return parseEventBody(req, res, next);
}

const createValidators = [
  body('title').trim().notEmpty(),
  body('clientProjectName').trim().notEmpty(),
  body('quoteDueDate').notEmpty(),
  body('requiredDeliveryDate').notEmpty(),
  body('partName').trim().notEmpty(),
  body('partNumber').trim().notEmpty(),
  body('revisionLevel').optional({ nullable: true }).trim(),
  body('materialSpecification').optional({ nullable: true }).trim(),
  body('quantity').notEmpty(),
  body('unitOfMeasure').trim().notEmpty(),
  body('specialProcesses').optional().isArray(),
  body('toleranceNotes').optional({ nullable: true }).trim(),
  body('requiredCertifications').optional().isArray(),
  body('itarExportControl').isBoolean().toBoolean(),
  body('countryOfOriginRestriction').optional({ nullable: true }).trim(),
  body('incoterms').trim().notEmpty(),
  body('targetBudgetaryPrice').optional({ nullable: true }),
  body('paymentTerms').optional({ nullable: true }).trim(),
  body('currency').trim().notEmpty(),
  body('quotesRequired').optional({ nullable: true }),
  body('processServiceIds').optional().isArray(),
  body('processServiceNames').optional().isArray(),
  body('processTagIds').optional().isArray(),
  body('processTagNames').optional().isArray(),
  body('invites').optional().isArray(),
];

const updateValidators = [
  body('id').notEmpty(),
  body('title').optional().trim().notEmpty(),
  body('clientProjectName').optional().trim().notEmpty(),
  body('quoteDueDate').optional().notEmpty(),
  body('requiredDeliveryDate').optional().notEmpty(),
  body('partName').optional().trim().notEmpty(),
  body('partNumber').optional().trim().notEmpty(),
  body('revisionLevel').optional({ nullable: true }).trim(),
  body('materialSpecification').optional({ nullable: true }).trim(),
  body('quantity').optional().notEmpty(),
  body('unitOfMeasure').optional().trim().notEmpty(),
  body('specialProcesses').optional().isArray(),
  body('toleranceNotes').optional({ nullable: true }).trim(),
  body('requiredCertifications').optional().isArray(),
  body('itarExportControl').optional().isBoolean().toBoolean(),
  body('countryOfOriginRestriction').optional({ nullable: true }).trim(),
  body('incoterms').optional().trim().notEmpty(),
  body('targetBudgetaryPrice').optional({ nullable: true }),
  body('paymentTerms').optional({ nullable: true }).trim(),
  body('currency').optional().trim().notEmpty(),
  body('quotesRequired').optional({ nullable: true }),
  body('processServiceIds').optional().isArray(),
  body('processServiceNames').optional().isArray(),
  body('processTagIds').optional().isArray(),
  body('processTagNames').optional().isArray(),
  body('invites').optional().isArray(),
  body('removeDocumentIds').optional().isArray(),
  body('removeDocumentIds.*').optional().isUUID(),
  body('status').optional().isIn(['DRAFT', 'SENT', 'QUOTES_RECEIVED', 'AWARDED', 'CLOSED']),
];

router.use(authenticate, requireRole('ADMIN'));

router.get('/', parseEventBody, asyncHandler(rfqController.listRfqs));
router.post('/', parseEventBody, asyncHandler(rfqController.listRfqs));
router.post('/get', parseEventBody, [body('id').notEmpty()], validate, asyncHandler(rfqController.getRfq));
router.post('/create', multipartOrJson, createValidators, validate, asyncHandler(rfqController.createRfq));
router.post('/update', multipartOrJson, updateValidators, validate, asyncHandler(rfqController.updateRfq));
router.post(
  '/delete',
  parseEventBody,
  [body('id').notEmpty()],
  validate,
  asyncHandler(rfqController.deleteRfq)
);
router.post(
  '/suggest-suppliers',
  parseEventBody,
  [
    body('processServiceIds').optional().isArray(),
    body('processTagIds').optional().isArray(),
    body('itarExportControl').optional().isBoolean().toBoolean(),
  ],
  validate,
  asyncHandler(rfqController.suggestSuppliers)
);
router.post(
  '/file-url',
  parseEventBody,
  [body('rfqId').notEmpty(), body('id').notEmpty()],
  validate,
  asyncHandler(rfqController.getFileUrl)
);

module.exports = router;
