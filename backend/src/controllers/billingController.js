const stripe = require('../config/stripe');
const db = require('../config/database');

async function createCheckoutSession(req, res) {
  try {
    const { user } = req;
    const { planCode } = req.body;

    const priceMap = {
      annual: process.env.STRIPE_ANNUAL_PRICE_ID,
      'per-filing': process.env.STRIPE_PER_FILING_PRICE_ID,
    };

    const priceId = priceMap[planCode];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan code' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: planCode === 'annual' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId: user.id.toString(),
        planCode,
      },
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

async function webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await db.query(
      'INSERT INTO payment_events (stripe_event_id, type, payload_json) VALUES ($1, $2, $3)',
      [event.id, event.type, JSON.stringify(event)],
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planCode } = session.metadata;

        let stripeCustomerId = session.customer;
        let stripeSubscriptionId = null;

        if (session.mode === 'subscription') {
          stripeSubscriptionId = session.subscription;
        }

        const existing = await db.query(
          'SELECT * FROM subscriptions WHERE user_id = $1',
          [userId],
        );

        if (existing.rows.length > 0) {
          await db.query(
            `UPDATE subscriptions 
            SET stripe_customer_id = $1, stripe_subscription_id = $2, plan_code = $3,
                status = $4, current_period_start = $5, current_period_end = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $7`,
            [
              stripeCustomerId,
              stripeSubscriptionId,
              planCode,
              'ACTIVE',
              new Date(),
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              userId,
            ],
          );
        } else {
          await db.query(
            `INSERT INTO subscriptions 
            (user_id, stripe_customer_id, stripe_subscription_id, plan_code, status,
             current_period_start, current_period_end)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              userId,
              stripeCustomerId,
              stripeSubscriptionId,
              planCode,
              'ACTIVE',
              new Date(),
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            ],
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await db.query(
          `UPDATE subscriptions 
          SET status = $1, current_period_start = $2, current_period_end = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = $4`,
          [
            subscription.status === 'active' ? 'ACTIVE' : subscription.status.toUpperCase(),
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.id,
          ],
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await db.query(
          `UPDATE subscriptions 
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = $2`,
          ['CANCELED', subscription.id],
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function getBillingStatus(req, res) {
  try {
    const { user } = req;

    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [user.id],
    );

    if (result.rows.length === 0) {
      return res.json({
        hasActiveSubscription: false,
        subscription: null,
      });
    }

    const subscription = result.rows[0];

    return res.json({
      hasActiveSubscription: subscription.status === 'ACTIVE',
      subscription: {
        planCode: subscription.plan_code,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('Get billing status error:', error);
    return res.status(500).json({ error: 'Failed to get billing status' });
  }
}

module.exports = {
  createCheckoutSession,
  webhook,
  getBillingStatus,
};
