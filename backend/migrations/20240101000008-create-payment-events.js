exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE payment_events (
      id SERIAL PRIMARY KEY,
      stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(100) NOT NULL,
      payload_json JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_payment_events_stripe_event_id ON payment_events(stripe_event_id);
    CREATE INDEX idx_payment_events_type ON payment_events(type);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS payment_events CASCADE;`);
};

exports._meta = {
  version: 1,
};
