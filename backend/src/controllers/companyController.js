const db = require('../config/database');
const { logAudit } = require('../utils/auditLog');

async function createCompany(req, res) {
  try {
    const { user } = req;
    const {
      legalName,
      businessNumber,
      incorporationDate,
      province,
      fiscalYearEnd,
      gstHstRegistered,
      gstHstNumber,
      gstHstRate,
      gstHstFilingFrequency,
    } = req.body;

    const result = await db.query(
      `INSERT INTO companies 
      (user_id, legal_name, business_number, incorporation_date, province, fiscal_year_end, 
       gst_hst_registered, gst_hst_number, gst_hst_rate, gst_hst_filing_frequency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        user.id,
        legalName,
        businessNumber,
        incorporationDate,
        province,
        fiscalYearEnd,
        gstHstRegistered,
        gstHstNumber,
        gstHstRate,
        gstHstFilingFrequency,
      ],
    );

    const company = result.rows[0];

    await logAudit(user.id, company.id, 'CREATE', 'company', company.id, { company });

    return res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({ error: 'Failed to create company' });
  }
}

async function getCompanies(req, res) {
  try {
    const { user } = req;

    const result = await db.query(
      'SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get companies error:', error);
    return res.status(500).json({ error: 'Failed to get companies' });
  }
}

async function getCompany(req, res) {
  try {
    return res.json(req.company);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get company' });
  }
}

async function updateCompany(req, res) {
  try {
    const { user, company } = req;
    const {
      legalName,
      businessNumber,
      incorporationDate,
      province,
      fiscalYearEnd,
      gstHstRegistered,
      gstHstNumber,
      gstHstRate,
      gstHstFilingFrequency,
    } = req.body;

    const result = await db.query(
      `UPDATE companies 
      SET legal_name = $1, business_number = $2, incorporation_date = $3, province = $4,
          fiscal_year_end = $5, gst_hst_registered = $6, gst_hst_number = $7,
          gst_hst_rate = $8, gst_hst_filing_frequency = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        legalName,
        businessNumber,
        incorporationDate,
        province,
        fiscalYearEnd,
        gstHstRegistered,
        gstHstNumber,
        gstHstRate,
        gstHstFilingFrequency,
        company.id,
      ],
    );

    await logAudit(user.id, company.id, 'UPDATE', 'company', company.id, {
      before: company,
      after: result.rows[0],
    });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    return res.status(500).json({ error: 'Failed to update company' });
  }
}

async function deleteCompany(req, res) {
  try {
    const { user, company } = req;

    await db.query('DELETE FROM companies WHERE id = $1', [company.id]);

    await logAudit(user.id, company.id, 'DELETE', 'company', company.id, { company });

    return res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    return res.status(500).json({ error: 'Failed to delete company' });
  }
}

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
};
