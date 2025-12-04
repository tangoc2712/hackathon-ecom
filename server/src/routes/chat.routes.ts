import express from 'express';
import { 
    processMessage, 
    getSessionHistory, 
    getCustomerHistory, 
    deleteSessionHistory,
    checkHealth 
} from '../controllers/chat.controller';

const router = express.Router();

/**
 * Chat API Routes
 * Following API_GUIDE.md specification
 * 
 * All routes are public (no authentication required) as the RAG service
 * handles role-based access based on customer_id lookup in database.
 * 
 * Role Logic for home page:
 * - Logged in user (admin/user): pass customer_id in request body
 * - Visitor (not logged in): don't pass customer_id, uses visitor mode
 */

// POST /api/v1/chat/message - Send a chat message
router.post('/message', processMessage);

// GET /api/v1/chat/health - Check RAG service health
router.get('/health', checkHealth);

// GET /api/v1/chat/history/:sessionId - Get session history
router.get('/history/:sessionId', getSessionHistory);

// GET /api/v1/chat/history/customer/:customerId - Get customer history
router.get('/history/customer/:customerId', getCustomerHistory);

// DELETE /api/v1/chat/history/:sessionId - Delete session history
router.delete('/history/:sessionId', deleteSessionHistory);

export default router;
