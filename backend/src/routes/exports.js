const express = require('express');
const exportController = require('../controllers/exportController');
const authenticateJWT = require('../middleware/auth');
const checkCompanyAccess = require('../middleware/checkCompanyAccess');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/:companyId/exports',
  checkCompanyAccess,
  exportController.generateTaxReadyPack,
);

router.get(
  '/:companyId/exports',
  checkCompanyAccess,
  exportController.getExports,
);

router.get(
  '/:companyId/exports/:exportId/url',
  checkCompanyAccess,
  exportController.getExportUrl,
);

module.exports = router;
