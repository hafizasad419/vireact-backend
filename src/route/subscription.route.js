import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

import {
    getSubscription,
    createCheckoutSession,
    handleWebhook,
    cancelSubscription
} from '../controller/subscription.controller.js';

const router = express.Router();

// Get current subscription and usage
router.get('/', authenticateToken, getSubscription);

// Create Stripe checkout session
router.post('/checkout', authenticateToken, createCheckoutSession);

// Handle Stripe webhooks (no auth - Stripe sends these)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Cancel subscription
router.post('/cancel', authenticateToken, cancelSubscription);

export default router;

