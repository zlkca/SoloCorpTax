exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE exports (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      tax_year INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      s3_key VARCHAR(500) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'completed',
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_exports_company_id ON exports(company_id);
    CREATE INDEX idx_exports_tax_year ON exports(tax_year);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS exports CASCADE;`);
};

exports._meta = {
  version: 1,
};
