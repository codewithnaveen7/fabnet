const express = require('express');
const capabilityTagController = require('../controllers/capabilityTagController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const requireRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(parseEventBody);
router.use(authenticate, requireRole('ADMIN'));

router.get('/', asyncHandler(capabilityTagController.listTags));
router.post('/', asyncHandler(capabilityTagController.listTags));

module.exports = router;
