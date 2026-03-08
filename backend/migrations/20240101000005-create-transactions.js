exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      transaction_date DATE NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'CAD',
      category VARCHAR(100),
      subcategory VARCHAR(100),
      account_name VARCHAR(255),
      vendor VARCHAR(255),
      treatment VARCHAR(50),
      needs_review BOOLEAN DEFAULT TRUE,
      is_gst_taxable BOOLEAN,
      is_itc_eligible BOOLEAN,
      notes TEXT,
      source_file VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_transactions_company_id ON transactions(company_id);
    CREATE INDEX idx_transactions_date ON transactions(transaction_date);
    CREATE INDEX idx_transactions_category ON transactions(category);
    CREATE INDEX idx_transactions_needs_review ON transactions(needs_review);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS transactions CASCADE;`);
};

exports._meta = {
  version: 1,
};
