import type { InertiaLinkProps } from '@inertiajs/react';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function withBasePath(
    path: string | { url?: string } | undefined | null,
): string {
    const basePath =
        typeof import.meta.env.BASE_URL === 'string' &&
        import.meta.env.BASE_URL.trim() !== ''
            ? import.meta.env.BASE_URL
            : '/';

    if (path === null || path === undefined) {
        return basePath;
    }

    const pathString =
        typeof path === 'string' && path !== ''
            ? path
            : typeof path === 'object' && typeof path.url === 'string'
              ? path.url
              : '/';

    if (typeof pathString !== 'string') {
        return import.meta.env.BASE_URL || '/';
    }

    if (pathString.startsWith(basePath)) {
        return pathString;
    }

    if (pathString.startsWith('/')) {
        const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        return base + pathString;
    }

    return basePath + pathString;
}

