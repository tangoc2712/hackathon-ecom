import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTrackUserEventMutation, useTrackSessionEventMutation } from '../redux/api/event.api';
import {
    USER_EVENT_NAMES,
    SESSION_EVENT_TYPES,
    UserEventPayload,
    SessionEventPayload,
} from '../types/eventTypes';
import { getOrCreateAnonymousUserId } from '../utils/anonymousUser';

interface RootState {
    user: {
        user: {
            user_id?: string;
            _id?: string;
        } | null;
        loading: boolean;
    };
}

/**
 * Custom hook for tracking events with automatic user context
 */
export const useEventTracking = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const location = useLocation();

    // RTK Query mutations
    const [trackUserEventMutation] = useTrackUserEventMutation();
    const [trackSessionEventMutation] = useTrackSessionEventMutation();

    /**
     * Get UTM parameters from URL
     */
    const getUTMParams = useCallback(() => {
        const params = new URLSearchParams(location.search);
        return {
            source: params.get('utm_source'),
            campaign: params.get('utm_campaign'),
            medium: params.get('utm_medium'),
        };
    }, [location.search]);

    /**
     * Track user event (sent to event_topic)
     */
    const trackUserEvent = useCallback(
        (payload: Omit<UserEventPayload, 'user_id'>) => {
            // Use real user_id if logged in, otherwise use anonymous ID from sessionStorage
            const userId = user?.user_id || getOrCreateAnonymousUserId();

            trackUserEventMutation({
                ...payload,
                user_id: userId,
            }).catch(error => {
                // Errors are already logged in the API, just prevent unhandled promise rejection
                console.debug('Event tracking error (will retry):', error);
            });
        },
        [user?.user_id, trackUserEventMutation]
    );

    /**
     * Track session event (sent to session_topic)
     */
    const trackSessionEvent = useCallback(
        (payload: Omit<SessionEventPayload, 'user_id'>) => {
            // Use real user_id if logged in, otherwise use anonymous ID from sessionStorage
            const userId = user?.user_id || getOrCreateAnonymousUserId();

            trackSessionEventMutation({
                ...payload,
                user_id: userId,
            }).catch(error => {
                console.debug('Session event tracking error (will retry):', error);
            });
        },
        [user?.user_id, trackSessionEventMutation]
    );

    /**
     * Track product view
     */
    const trackViewProduct = useCallback(
        (productId: string, productName?: string, category?: string, price?: number) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.VIEW_PRODUCT,
                product_id: productId,
                product_name: productName || null,
                category: category || null,
                price: price || null,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track add to cart
     */
    const trackAddToCart = useCallback(
        (productId: string, quantity: number, price: number, productName?: string) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.ADD_TO_CART,
                product_id: productId,
                quantity,
                price,
                product_name: productName || null,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track checkout
     */
    const trackCheckout = useCallback(
        (totalAmount: number) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.CHECKOUT,
                total_amount: totalAmount,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track purchase
     */
    const trackPurchase = useCallback(
        (orderId: string, totalAmount: number) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.PURCHASE,
                order_id: orderId,
                total_amount: totalAmount,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track search
     */
    const trackSearch = useCallback(
        (searchQuery: string) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.SEARCH,
                search_query: searchQuery,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track comment
     */
    const trackComment = useCallback(
        (productId: string) => {
            trackUserEvent({
                event_name: USER_EVENT_NAMES.COMMENT,
                product_id: productId,
                page_url: location.pathname,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
            });
        },
        [trackUserEvent, location.pathname]
    );

    /**
     * Track login
     */
    const trackLogin = useCallback(() => {
        trackUserEvent({
            event_name: USER_EVENT_NAMES.LOGIN,
            page_url: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
        });
    }, [trackUserEvent, location.pathname]);

    /**
     * Track logout
     */
    const trackLogout = useCallback(() => {
        trackUserEvent({
            event_name: USER_EVENT_NAMES.LOGOUT,
            page_url: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
        });
    }, [trackUserEvent, location.pathname]);

    /**
     * Track page view
     */
    const trackPageView = useCallback(() => {
        trackUserEvent({
            event_name: USER_EVENT_NAMES.PAGE_VIEW,
            page_url: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
        });
    }, [trackUserEvent, location.pathname]);

    /**
     * Track session open
     */
    const trackOpenSession = useCallback(() => {
        const utm = getUTMParams();
        trackSessionEvent({
            session_event_type: SESSION_EVENT_TYPES.OPEN_SESSION,
            source: utm.source,
            campaign: utm.campaign,
            medium: utm.medium,
        });
    }, [trackSessionEvent, getUTMParams]);

    /**
     * Track session close
     */
    const trackCloseSession = useCallback(() => {
        const utm = getUTMParams();
        trackSessionEvent({
            session_event_type: SESSION_EVENT_TYPES.CLOSE_SESSION,
            source: utm.source,
            campaign: utm.campaign,
            medium: utm.medium,
        });
    }, [trackSessionEvent, getUTMParams]);

    return {
        // User events
        trackUserEvent,
        trackViewProduct,
        trackAddToCart,
        trackCheckout,
        trackPurchase,
        trackSearch,
        trackComment,
        trackLogin,
        trackLogout,
        trackPageView,

        // Session events
        trackSessionEvent,
        trackOpenSession,
        trackCloseSession,
    };
};
