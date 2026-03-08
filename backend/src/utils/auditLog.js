const db = require('../config/database');

async function logAudit(userId, companyId, action, entityType, entityId, changes) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, changes) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, companyId, action, entityType, entityId, JSON.stringify(changes)],
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

module.exports = { logAudit };
