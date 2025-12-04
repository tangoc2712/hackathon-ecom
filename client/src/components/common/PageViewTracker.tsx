import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventTracking } from '../../hooks/useEventTracking';

const PageViewTracker: React.FC = () => {
    const location = useLocation();
    const { trackPageView } = useEventTracking();

    useEffect(() => {
        trackPageView();
    }, [location.pathname, trackPageView]);

    return null;
};

export default PageViewTracker;
