const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const parseEventBody = require('../middleware/parseEventBody');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(parseEventBody);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

const profileValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
];

const passwordValidators = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
];

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  asyncHandler(authController.login),
);

router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post('/me', authenticate, asyncHandler(authController.getMe));

router.put(
  '/profile',
  authenticate,
  profileValidators,
  validate,
  asyncHandler(authController.updateProfile),
);
router.post(
  '/profile',
  authenticate,
  profileValidators,
  validate,
  asyncHandler(authController.updateProfile),
);

router.put(
  '/password',
  authenticate,
  passwordValidators,
  validate,
  asyncHandler(authController.changePassword),
);
router.post(
  '/password',
  authenticate,
  passwordValidators,
  validate,
  asyncHandler(authController.changePassword),
);

module.exports = router;
