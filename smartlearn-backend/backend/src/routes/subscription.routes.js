import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { addSubscriptionData } from '../middleware/subscription.js';
import {
  getUserSubscriptionDetails,
  getUserUsageStats,
  checkUserPermissions
} from '../controllers/subscription.controller.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticateToken);

// Get user's subscription details and current usage
router.get('/details', addSubscriptionData, getUserSubscriptionDetails);

// Get detailed usage statistics
router.get('/usage', addSubscriptionData, getUserUsageStats);

// Check if user can perform specific actions
router.get('/check-permissions', addSubscriptionData, checkUserPermissions);

export default router;