import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getUserSubscription,
  cancelSubscription,
  handleWebhook
} from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All payment routes require authentication except webhooks
router.use(authenticateToken);

// Create payment order
router.post('/create-order', createOrder);

// Verify payment and create subscription
router.post('/verify', verifyPayment);

// Get user's current subscription
router.get('/subscription', getUserSubscription);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Webhook endpoint (no authentication required for webhooks)
export const webhookRouter = Router();
webhookRouter.post('/razorpay', handleWebhook);

export default router;