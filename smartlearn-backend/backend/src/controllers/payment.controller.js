import crypto from 'crypto';
import Razorpay from 'razorpay';
import pool from '../config/database.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Pricing plans configuration (in paise)
const PRICING_PLANS = {
  starter: {
    monthly: 29900,  // ₹299
    yearly: 299900,  // ₹2999
  },
  pro: {
    monthly: 79900,  // ₹799
    yearly: 799900,  // ₹7999
  },
  enterprise: {
    monthly: 199900, // ₹1999
    yearly: 1999900, // ₹19999
  }
};

// Create Razorpay Order
export const createOrder = async (req, res) => {
  const { planType, billingCycle } = req.body;

  try {
    // Validate plan type and billing cycle
    if (!['starter', 'pro', 'enterprise'].includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type',
        code: 'INVALID_PLAN'
      });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle',
        code: 'INVALID_BILLING_CYCLE'
      });
    }

    const amount = PRICING_PLANS[planType][billingCycle];

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planType,
        billingCycle,
        userId: req.userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planType,
        billingCycle
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
      code: 'ORDER_CREATION_FAILED'
    });
  }
};

// Verify payment and create subscription
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
    billingCycle
  } = req.body;

  try {
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
        code: 'INVALID_SIGNATURE'
      });
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        error: 'Payment not successful',
        code: 'PAYMENT_NOT_CAPTURED'
      });
    }

    // Calculate subscription expiry date
    const now = new Date();
    let expiresAt = new Date(now);

    if (billingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Create subscription record
    const subscriptionQuery = `
      INSERT INTO subscriptions
      (user_id, plan_type, billing_cycle, status, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, started_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      req.userId,
      planType,
      billingCycle,
      'active',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment.amount,
      payment.currency,
      now,
      expiresAt
    ];

    const result = await pool.query(subscriptionQuery, values);
    const subscription = result.rows[0];

    // Update user's subscription info if needed (you can add a subscription column to users table)
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.userId]
    );

    res.status(201).json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          planType: subscription.plan_type,
          billingCycle: subscription.billing_cycle,
          status: subscription.status,
          startedAt: subscription.started_at,
          expiresAt: subscription.expires_at,
          amount: subscription.amount
        }
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      code: 'PAYMENT_VERIFICATION_FAILED'
    });
  }
};

// Get user's subscription status
export const getUserSubscription = async (req, res) => {
  try {
    const query = `
      SELECT * FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [req.userId]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          subscription: null,
          planType: 'free'
        }
      });
    }

    const subscription = result.rows[0];

    // Check if subscription has expired
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);

    if (now > expiresAt && subscription.status === 'active') {
      // Update status to expired
      await pool.query(
        'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['expired', subscription.id]
      );
      subscription.status = 'expired';
    }

    res.status(200).json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          planType: subscription.plan_type,
          billingCycle: subscription.billing_cycle,
          status: subscription.status,
          startedAt: subscription.started_at,
          expiresAt: subscription.expires_at,
          amount: subscription.amount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription details',
      code: 'SUBSCRIPTION_FETCH_FAILED'
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const query = `
      UPDATE subscriptions
      SET status = $1, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND status = $3
      RETURNING *
    `;

    const result = await pool.query(query, [req.userId, 'cancelled', 'active']);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
        code: 'NO_ACTIVE_SUBSCRIPTION'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Subscription cancelled successfully',
        subscription: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      code: 'SUBSCRIPTION_CANCELLATION_FAILED'
    });
  }
};

// Webhook handler for Razorpay
export const handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  try {
    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment was successful - you might want to implement additional logic here
        console.log('Payment captured:', req.body.payload.payment.entity);
        break;

      case 'payment.failed':
        // Payment failed - update subscription status if needed
        console.log('Payment failed:', req.body.payload.payment.entity);
        break;

      case 'subscription.charged':
        // For recurring subscriptions (if you implement them)
        console.log('Subscription charged:', req.body.payload.subscription.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook handling failed'
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  getUserSubscription,
  cancelSubscription,
  handleWebhook
};