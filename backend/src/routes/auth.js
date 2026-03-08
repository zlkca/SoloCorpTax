const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    validate,
  ],
  authController.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  authController.login,
);

router.post('/refresh', authController.refreshAccessToken);

router.post('/logout', authController.logout);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback,
);

router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router;
