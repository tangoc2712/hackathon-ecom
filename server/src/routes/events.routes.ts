import { Router } from 'express';
import {
    trackUserEvent,
    trackSessionEvent,
    checkHealth,
} from '../controllers/events.controller';

const router = Router();

// User event tracking (sent to event_topic)
router.post('/user', trackUserEvent);

// Session event tracking (sent to session_topic)
router.post('/session', trackSessionEvent);

// Health check
router.get('/health', checkHealth);

export default router;
