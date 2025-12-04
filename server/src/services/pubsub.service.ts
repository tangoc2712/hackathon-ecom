import { PubSub, Topic } from '@google-cloud/pubsub';

// User event interface (sent to event_topic)
interface UserEvent {
    session_id: string;
    user_id: string | null;
    event_name: string;
    page_url: string | null;
    referrer: string | null;
    user_agent: string | null;
    product_id: string | null;
    [key: string]: any;
}

// Session event interface (sent to session_topic)
interface SessionEvent {
    session_id: string;
    user_id: string | null;
    session_event_type: string;
    source: string | null;
    campaign: string | null;
    medium: string | null;
}

class PubSubService {
    private pubSubClient: PubSub | null = null;
    private eventTopic: Topic | null = null;
    private sessionTopic: Topic | null = null;
    private isEnabled: boolean;

    // Google Cloud Project and Topic names
    private readonly PROJECT_ID = 'hackathon-478514';
    private readonly EVENT_TOPIC_PATH = 'projects/hackathon-478514/topics/ndsv-pubsub';
    private readonly SESSION_TOPIC_PATH = 'projects/hackathon-478514/topics/session-topic';

    constructor() {
        this.isEnabled = process.env.ENABLE_PUBSUB === 'true';

        if (this.isEnabled) {
            this.initialize();
        }
    }

    /**
     * Initialize Google Cloud Pub/Sub client
     */
    private initialize(): void {
        try {
            // Initialize Pub/Sub client
            this.pubSubClient = new PubSub({
                projectId: this.PROJECT_ID,
            });

            // Get topics
            this.eventTopic = this.pubSubClient.topic(this.EVENT_TOPIC_PATH);
            this.sessionTopic = this.pubSubClient.topic(this.SESSION_TOPIC_PATH);

            console.log(`Pub/Sub initialized with topics:`);
            console.log(`  - Event topic: ${this.EVENT_TOPIC_PATH}`);
            console.log(`  - Session topic: ${this.SESSION_TOPIC_PATH}`);
        } catch (error) {
            console.error('Failed to initialize Pub/Sub:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Publish a user event to event_topic
     */
    async publishUserEvent(event: UserEvent): Promise<void> {
        if (!this.isEnabled || !this.eventTopic) {
            console.warn('Pub/Sub is not enabled, user event not published:', event.event_name);
            return;
        }

        try {
            // Convert event to JSON buffer
            const dataBuffer = Buffer.from(JSON.stringify(event));

            // Publish with attributes
            const messageId = await this.eventTopic.publishMessage({
                data: dataBuffer,
                attributes: {
                    event_name: event.event_name,
                    user_id: event.user_id || 'anonymous',
                    session_id: event.session_id,
                },
            });

            console.log(`User event published: ${event.event_name} - Message ID: ${messageId}`);
        } catch (error) {
            console.error('Failed to publish user event to Pub/Sub:', error);
            throw error;
        }
    }

    /**
     * Publish a session event to session_topic
     */
    async publishSessionEvent(event: SessionEvent): Promise<void> {
        if (!this.isEnabled || !this.sessionTopic) {
            console.warn('Pub/Sub is not enabled, session event not published:', event.session_event_type);
            return;
        }

        try {
            // Convert event to JSON buffer
            const dataBuffer = Buffer.from(JSON.stringify(event));

            // Publish with attributes
            const messageId = await this.sessionTopic.publishMessage({
                data: dataBuffer,
                attributes: {
                    session_event_type: event.session_event_type,
                    user_id: event.user_id || 'anonymous',
                    session_id: event.session_id,
                },
            });

            console.log(`Session event published: ${event.session_event_type} - Message ID: ${messageId}`);
        } catch (error) {
            console.error('Failed to publish session event to Pub/Sub:', error);
            throw error;
        }
    }

    /**
     * Publish multiple user events in batch
     */
    async publishUserEventBatch(events: UserEvent[]): Promise<void> {
        if (!this.isEnabled || !this.eventTopic) {
            console.warn('Pub/Sub is not enabled, batch user events not published');
            return;
        }

        try {
            const publishPromises = events.map(event =>
                this.publishUserEvent(event).catch(error => {
                    console.error(`Failed to publish user event ${event.event_name}:`, error);
                    return null;
                })
            );

            await Promise.all(publishPromises);
            console.log(`Published batch of ${events.length} user events`);
        } catch (error) {
            console.error('Failed to publish user events batch to Pub/Sub:', error);
            throw error;
        }
    }

    /**
     * Publish multiple session events in batch
     */
    async publishSessionEventBatch(events: SessionEvent[]): Promise<void> {
        if (!this.isEnabled || !this.sessionTopic) {
            console.warn('Pub/Sub is not enabled, batch session events not published');
            return;
        }

        try {
            const publishPromises = events.map(event =>
                this.publishSessionEvent(event).catch(error => {
                    console.error(`Failed to publish session event ${event.session_event_type}:`, error);
                    return null;
                })
            );

            await Promise.all(publishPromises);
            console.log(`Published batch of ${events.length} session events`);
        } catch (error) {
            console.error('Failed to publish session events batch to Pub/Sub:', error);
            throw error;
        }
    }

    /**
     * Check if Pub/Sub is enabled and ready
     */
    isReady(): boolean {
        return this.isEnabled && this.eventTopic !== null && this.sessionTopic !== null;
    }

    /**
     * Close the Pub/Sub client
     */
    async close(): Promise<void> {
        if (this.pubSubClient) {
            await this.pubSubClient.close();
            console.log('Pub/Sub client closed');
        }
    }
}

// Export singleton instance
export const pubsubService = new PubSubService();
