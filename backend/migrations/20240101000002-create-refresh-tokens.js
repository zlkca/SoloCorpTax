exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS refresh_tokens CASCADE;`);
};

exports._meta = {
  version: 1,
};
