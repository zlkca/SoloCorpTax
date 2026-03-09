const db = require('../config/database');

async function checkCompanyAccess(req, res, next) {
  try {
    const { companyId } = req.params;
    const { user } = req;

    const result = await db.query(
      'SELECT * FROM companies WHERE id = $1 AND user_id = $2',
      [companyId, user.id],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }

    [req.company] = result.rows;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking company access' });
  }
}

module.exports = checkCompanyAccess;
