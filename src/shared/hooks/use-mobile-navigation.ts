import { useCallback } from 'react';

export function useMobileNavigation(): () => void {
    return useCallback(() => {
        if (typeof document === 'undefined') {
            return;
        }

        if (document.body === null || document.body === undefined) {
            return;
        }

        document.body.style.removeProperty('pointer-events');
    }, []);
}

