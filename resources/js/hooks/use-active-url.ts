import { withBasePath } from '@/lib/utils';
import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export function useActiveUrl() {
    const page = usePage();
    const currentUrlPath = new URL(page.url, window?.location.origin).pathname;

    function urlIsActive(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) {
        const urlToCompare = currentUrl ?? currentUrlPath;
        // Normalizar ambas URLs con withBasePath para comparación correcta
        const normalizedCheck = withBasePath(urlToCheck);
        const normalizedCurrent = withBasePath(urlToCompare);
        return normalizedCheck === normalizedCurrent;
    }

    return {
        currentUrl: currentUrlPath,
        urlIsActive,
    };
}
