import React, { useEffect } from 'react';
import { useEventTracking } from '../../hooks/useEventTracking';

const SessionTracker: React.FC = () => {
    const { trackOpenSession, trackCloseSession } = useEventTracking();

    useEffect(() => {
        // Track session open on mount
        trackOpenSession();

        // Track session close on unmount
        return () => {
            trackCloseSession();
        };
    }, [trackOpenSession, trackCloseSession]);

    useEffect(() => {
        // Track session close on window close/reload
        const handleBeforeUnload = () => {
            trackCloseSession();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [trackCloseSession]);

    return null;
};

export default SessionTracker;
