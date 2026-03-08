exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE categorization_rules (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      vendor_pattern VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      subcategory VARCHAR(100),
      priority INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_categorization_rules_company_id ON categorization_rules(company_id);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS categorization_rules CASCADE;`);
};

exports._meta = {
  version: 1,
};
