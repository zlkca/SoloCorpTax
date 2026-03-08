exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_google_id ON users(google_id);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS users CASCADE;`);
};

exports._meta = {
  version: 1,
};
