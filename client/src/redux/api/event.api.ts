import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserEvent, SessionEvent, UserEventPayload, SessionEventPayload } from '../../types/eventTypes';

// Helper to get or create session ID
const getSessionId = (): string => {
    const SESSION_KEY = 'tracking_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};

// Transform user event payload to match backend schema
const transformUserEventPayload = (payload: UserEventPayload): UserEvent => {
    const event: UserEvent = {
        session_id: getSessionId(),
        user_id: payload.user_id || null,
        event_name: payload.event_name,
        page_url: payload.page_url || window.location.pathname,
        referrer: payload.referrer || document.referrer || null,
        user_agent: payload.user_agent || navigator.userAgent || null,
        product_id: payload.product_id || null,
        search_query: payload.search_query || undefined,
        order_id: payload.order_id || undefined,
        total_amount: payload.total_amount || undefined,
        quantity: payload.quantity || undefined,
        price: payload.price || undefined,
        category: payload.category || undefined,
        product_name: payload.product_name || undefined,
    };

    // Remove undefined fields
    Object.keys(event).forEach(key =>
        event[key as keyof UserEvent] === undefined && delete event[key as keyof UserEvent]
    );

    return event;
};

// Transform session event payload
const transformSessionEventPayload = (payload: SessionEventPayload): SessionEvent => {
    return {
        session_id: getSessionId(),
        user_id: payload.user_id || null,
        session_event_type: payload.session_event_type,
        source: payload.source || null,
        campaign: payload.campaign || null,
        medium: payload.medium || null,
    };
};

export const eventApi = createApi({
    reducerPath: 'eventAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/events",
        credentials: 'include',
        timeout: 5000,
    }),
    tagTypes: ['Event'],
    endpoints: (builder) => ({
        // Track user event (view_product, add_to_cart, etc.)
        trackUserEvent: builder.mutation<void, UserEventPayload>({
            query: (payload) => ({
                url: '/user',
                method: 'POST',
                body: transformUserEventPayload(payload),
            }),
            // Don't throw errors on failure, just log them
            transformErrorResponse: (error) => {
                console.error('Failed to track user event:', error);
                return error;
            },
        }),

        // Track session event (open_session, close_session)
        trackSessionEvent: builder.mutation<void, SessionEventPayload>({
            query: (payload) => ({
                url: '/session',
                method: 'POST',
                body: transformSessionEventPayload(payload),
            }),
            transformErrorResponse: (error) => {
                console.error('Failed to track session event:', error);
                return error;
            },
        }),

        // Batch send user events (for queued events)
        batchTrackUserEvents: builder.mutation<void, UserEvent[]>({
            query: (events) => ({
                url: '/user/batch',
                method: 'POST',
                body: { events },
            }),
        }),

        // Batch send session events (for queued events)
        batchTrackSessionEvents: builder.mutation<void, SessionEvent[]>({
            query: (events) => ({
                url: '/session/batch',
                method: 'POST',
                body: { events },
            }),
        }),
    }),
});

export const {
    useTrackUserEventMutation,
    useTrackSessionEventMutation,
    useBatchTrackUserEventsMutation,
    useBatchTrackSessionEventsMutation,
} = eventApi;
