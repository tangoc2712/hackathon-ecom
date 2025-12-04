/**
 * Utility for managing anonymous users (session-only)
 */

const ANONYMOUS_USER_KEY = 'anonymous_user_id';

/**
 * Generate a unique anonymous user ID
 */
export const generateAnonymousUserId = (): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    return `anon_${timestamp}_${randomPart}${randomPart2}`;
};

/**
 * Get or create anonymous user ID (session-only, not persisted across browser restarts)
 */
export const getOrCreateAnonymousUserId = (): string => {
    let anonymousUserId = sessionStorage.getItem(ANONYMOUS_USER_KEY);

    if (!anonymousUserId) {
        anonymousUserId = generateAnonymousUserId();
        sessionStorage.setItem(ANONYMOUS_USER_KEY, anonymousUserId);
    }

    return anonymousUserId;
};

/**
 * Clear anonymous user ID (called after successful login)
 */
export const clearAnonymousUserId = (): void => {
    sessionStorage.removeItem(ANONYMOUS_USER_KEY);
};

/**
 * Check if user ID is anonymous
 */
export const isAnonymousUser = (userId: string | null | undefined): boolean => {
    return userId ? userId.startsWith('anon_') : false;
};
