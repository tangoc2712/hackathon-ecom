import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware';

const router = express.Router();

// Authenticated user routes
// router.post('/new', authenticateUser, createPaymentIntent); // Removed Stripe route

// ZaloPay routes
import { createZaloPayOrder, zaloPayCallback, checkPaymentStatus } from '../controllers/payment.controller';
router.post('/zalopay/create', authenticateUser, createZaloPayOrder);
router.post('/zalopay/callback', zaloPayCallback);
router.post('/zalopay/check-status', authenticateUser, checkPaymentStatus);

export default router;