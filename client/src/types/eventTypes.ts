// Event names for user events
export const USER_EVENT_NAMES = {
    VIEW_PRODUCT: 'view_product',
    ADD_TO_CART: 'add_to_cart',
    CHECKOUT: 'checkout',
    PURCHASE: 'purchase',
    SEARCH: 'search',
    COMMENT: 'comment',
    LOGIN: 'login',
    LOGOUT: 'logout',
    PAGE_VIEW: 'page_view',
} as const;

// Session event types
export const SESSION_EVENT_TYPES = {
    OPEN_SESSION: 'open_session',
    CLOSE_SESSION: 'close_session',
} as const;

export type UserEventName = typeof USER_EVENT_NAMES[keyof typeof USER_EVENT_NAMES];
export type SessionEventType = typeof SESSION_EVENT_TYPES[keyof typeof SESSION_EVENT_TYPES];

/**
 * User Event - sent to event_topic (ndsv-pubsub)
 * Structure for tracking user actions
 */
export interface UserEvent {
    session_id: string;
    user_id: string | null;
    event_name: UserEventName;
    page_url: string | null;
    referrer: string | null;
    user_agent: string | null;
    product_id: string | null;
    // Additional optional fields
    search_query?: string | null;
    order_id?: string | null;
    total_amount?: number | null;
    quantity?: number | null;
    price?: number | null;
    category?: string | null;
    product_name?: string | null;
}

/**
 * Session Event - sent to session_topic
 * Structure for tracking user sessions
 */
export interface SessionEvent {
    session_id: string;
    user_id: string | null;
    session_event_type: SessionEventType;
    source: string | null;
    campaign: string | null;
    medium: string | null;
}

// Payload types (fields to provide when creating events)
export type UserEventPayload = Partial<Omit<UserEvent, 'session_id'>> & {
    event_name: UserEventName;
};

export type SessionEventPayload = Partial<Omit<SessionEvent, 'session_id'>> & {
    session_event_type: SessionEventType;
};
