const express = require('express');
const documentController = require('../controllers/documentController');
const authenticateJWT = require('../middleware/auth');
const checkCompanyAccess = require('../middleware/checkCompanyAccess');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/:companyId/documents',
  checkCompanyAccess,
  documentController.upload.single('file'),
  documentController.uploadDocument,
);

router.get(
  '/:companyId/documents',
  checkCompanyAccess,
  documentController.getDocuments,
);

router.get(
  '/:companyId/documents/:documentId/url',
  checkCompanyAccess,
  documentController.getDocumentUrl,
);

router.delete(
  '/:companyId/documents/:documentId',
  checkCompanyAccess,
  documentController.deleteDocument,
);

module.exports = router;
