exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      s3_key VARCHAR(500) NOT NULL,
      file_size INTEGER,
      mime_type VARCHAR(100),
      tax_year INTEGER,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_documents_company_id ON documents(company_id);
    CREATE INDEX idx_documents_type ON documents(type);
    CREATE INDEX idx_documents_tax_year ON documents(tax_year);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS documents CASCADE;`);
};

exports._meta = {
  version: 1,
};
