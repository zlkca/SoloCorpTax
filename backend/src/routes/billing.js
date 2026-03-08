const express = require('express');
const billingController = require('../controllers/billingController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.post('/create-checkout-session', authenticateJWT, billingController.createCheckoutSession);

router.post('/webhook', express.raw({ type: 'application/json' }), billingController.webhook);

router.get('/status', authenticateJWT, billingController.getBillingStatus);

module.exports = router;
