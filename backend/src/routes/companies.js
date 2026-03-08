const express = require('express');
const { body } = require('express-validator');
const companyController = require('../controllers/companyController');
const authenticateJWT = require('../middleware/auth');
const checkCompanyAccess = require('../middleware/checkCompanyAccess');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticateJWT);

router.post(
  '/',
  [
    body('legalName').notEmpty().trim(),
    body('province').notEmpty().trim(),
    validate,
  ],
  companyController.createCompany,
);

router.get('/', companyController.getCompanies);

router.get('/:companyId', checkCompanyAccess, companyController.getCompany);

router.put('/:companyId', checkCompanyAccess, companyController.updateCompany);

router.delete('/:companyId', checkCompanyAccess, companyController.deleteCompany);

module.exports = router;
