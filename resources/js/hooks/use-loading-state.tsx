import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useLoadingState() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        // Listen to Inertia navigation events (router.on returns unsubscribe)
        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);
        const removeError = router.on('error', handleFinish);

        return () => {
            removeStart();
            removeFinish();
            removeError();
        };
    }, []);

    return isLoading;
}
