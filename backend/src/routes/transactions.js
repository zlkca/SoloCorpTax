const express = require('express');
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middleware/auth');
const checkCompanyAccess = require('../middleware/checkCompanyAccess');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/:companyId/transactions/upload',
  checkCompanyAccess,
  transactionController.upload.single('file'),
  transactionController.uploadCSV,
);

router.get(
  '/:companyId/transactions',
  checkCompanyAccess,
  transactionController.getTransactions,
);

router.get(
  '/:companyId/transactions/summary',
  checkCompanyAccess,
  transactionController.getSummary,
);

router.put(
  '/:companyId/transactions/:transactionId',
  checkCompanyAccess,
  transactionController.updateTransaction,
);

router.post(
  '/:companyId/transactions/bulk-update',
  checkCompanyAccess,
  transactionController.bulkUpdateTransactions,
);

router.delete(
  '/:companyId/transactions/:transactionId',
  checkCompanyAccess,
  transactionController.deleteTransaction,
);

module.exports = router;
