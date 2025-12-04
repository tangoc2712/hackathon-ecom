import { Request, Response } from 'express';
import { pubsubService } from '../services/pubsub.service';

/**
 * Handle user event tracking (sent to event_topic)
 */
export const trackUserEvent = async (req: Request, res: Response) => {
    try {
        const event = req.body;

        // Basic validation
        if (!event.event_name || !event.session_id) {
            return res.status(400).json({
                error: 'Missing required fields: event_name and session_id',
            });
        }

        // Publish to Pub/Sub event_topic
        await pubsubService.publishUserEvent(event);

        res.status(202).json({
            message: 'User event received',
            event_name: event.event_name,
        });
    } catch (error) {
        console.error('Error tracking user event:', error);
        res.status(500).json({
            error: 'Failed to track user event',
        });
    }
};

/**
 * Handle session event tracking (sent to session_topic)
 */
export const trackSessionEvent = async (req: Request, res: Response) => {
    try {
        const event = req.body;

        // Basic validation
        if (!event.session_event_type || !event.session_id) {
            return res.status(400).json({
                error: 'Missing required fields: session_event_type and session_id',
            });
        }

        // Publish to Pub/Sub session_topic
        await pubsubService.publishSessionEvent(event);

        res.status(202).json({
            message: 'Session event received',
            session_event_type: event.session_event_type,
        });
    } catch (error) {
        console.error('Error tracking session event:', error);
        res.status(500).json({
            error: 'Failed to track session event',
        });
    }
};

/**
 * Health check for Pub/Sub service
 */
export const checkHealth = async (req: Request, res: Response) => {
    try {
        const isReady = pubsubService.isReady();

        res.status(isReady ? 200 : 503).json({
            pubsubEnabled: isReady,
            status: isReady ? 'ready' : 'not configured',
            topics: isReady ? {
                event_topic: 'projects/hackathon-478514/topics/ndsv-pubsub',
                session_topic: 'projects/hackathon-478514/topics/session-topic',
            } : undefined,
        });
    } catch (error) {
        console.error('Error checking Pub/Sub health:', error);
        res.status(500).json({
            error: 'Health check failed',
        });
    }
};
