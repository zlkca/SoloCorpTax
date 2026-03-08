exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE companies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      legal_name VARCHAR(255) NOT NULL,
      business_number VARCHAR(50),
      incorporation_date DATE,
      province VARCHAR(50),
      fiscal_year_end VARCHAR(10),
      gst_hst_registered BOOLEAN DEFAULT FALSE,
      gst_hst_number VARCHAR(50),
      gst_hst_rate DECIMAL(5,2),
      gst_hst_filing_frequency VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_companies_user_id ON companies(user_id);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS companies CASCADE;`);
};

exports._meta = {
  version: 1,
};
