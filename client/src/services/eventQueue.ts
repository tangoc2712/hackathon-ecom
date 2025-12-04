import { UserEvent, SessionEvent } from '../types/eventTypes';

/**
 * Queue for events when offline or during errors
 * This service stores events in localStorage and can be used to retry failed events
 */
class EventQueue {
    private userEventQueue: UserEvent[] = [];
    private sessionEventQueue: SessionEvent[] = [];
    private readonly MAX_QUEUE_SIZE = 100;
    private readonly USER_EVENTS_KEY = 'user_events_queue';
    private readonly SESSION_EVENTS_KEY = 'session_events_queue';

    constructor() {
        this.loadFromStorage();
    }

    addUserEvent(event: UserEvent): void {
        this.userEventQueue.push(event);
        if (this.userEventQueue.length > this.MAX_QUEUE_SIZE) {
            this.userEventQueue.shift();
        }
        this.saveToStorage();
    }

    addSessionEvent(event: SessionEvent): void {
        this.sessionEventQueue.push(event);
        if (this.sessionEventQueue.length > this.MAX_QUEUE_SIZE) {
            this.sessionEventQueue.shift();
        }
        this.saveToStorage();
    }

    getUserEvents(): UserEvent[] {
        return [...this.userEventQueue];
    }

    getSessionEvents(): SessionEvent[] {
        return [...this.sessionEventQueue];
    }

    clearUserEvents(): void {
        this.userEventQueue = [];
        this.saveToStorage();
    }

    clearSessionEvents(): void {
        this.sessionEventQueue = [];
        this.saveToStorage();
    }

    removeUserEvents(count: number): void {
        this.userEventQueue.splice(0, count);
        this.saveToStorage();
    }

    removeSessionEvents(count: number): void {
        this.sessionEventQueue.splice(0, count);
        this.saveToStorage();
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.USER_EVENTS_KEY, JSON.stringify(this.userEventQueue));
            localStorage.setItem(this.SESSION_EVENTS_KEY, JSON.stringify(this.sessionEventQueue));
        } catch (error) {
            console.error('Failed to save event queue to storage:', error);
        }
    }

    private loadFromStorage(): void {
        try {
            const userEvents = localStorage.getItem(this.USER_EVENTS_KEY);
            const sessionEvents = localStorage.getItem(this.SESSION_EVENTS_KEY);

            if (userEvents) {
                this.userEventQueue = JSON.parse(userEvents);
            }
            if (sessionEvents) {
                this.sessionEventQueue = JSON.parse(sessionEvents);
            }
        } catch (error) {
            console.error('Failed to load event queue from storage:', error);
            this.userEventQueue = [];
            this.sessionEventQueue = [];
        }
    }
}

// Export singleton instance
export const eventQueue = new EventQueue();
