exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      plan_code VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
    CREATE INDEX idx_subscriptions_status ON subscriptions(status);
  `);
};

exports.down = function (db) {
  return db.runSql(`DROP TABLE IF EXISTS subscriptions CASCADE;`);
};

exports._meta = {
  version: 1,
};
