exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INTEGER,
      changes JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
    CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
};

exports._meta = {
  version: 1,
};
