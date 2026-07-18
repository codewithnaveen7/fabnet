const express = require('express');
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(parseEventBody);
router.use(authenticate, requireRole('ADMIN'));

router.get('/', asyncHandler(serviceController.listServices));
router.post('/', asyncHandler(serviceController.listServices));
router.post('/get', [body('id').notEmpty()], validate, asyncHandler(serviceController.getService));
router.post(
  '/create',
  [
    body('name').trim().notEmpty(),
    body('description').optional({ nullable: true }).trim(),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  validate,
  asyncHandler(serviceController.createService)
);
router.post(
  '/update',
  [
    body('id').notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('description').optional({ nullable: true }).trim(),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  validate,
  asyncHandler(serviceController.updateService)
);
router.post('/delete', [body('id').notEmpty()], validate, asyncHandler(serviceController.deleteService));

module.exports = router;
