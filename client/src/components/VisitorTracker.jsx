import { useEffect } from 'react';
import { visitorCount } from '../services/auth';

const VisitorTracker = () => {
    useEffect(() => {
        // Record visit once when the app loads
        visitorCount();
    }, []);

    return null;
};

export default VisitorTracker;
