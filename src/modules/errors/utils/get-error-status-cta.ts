export type ErrorStatusCode = 401 | 403 | 404 | 419 | 422 | 429 | 500;

interface ErrorStatusCta {
    href: string;
    label: string;
}

export function getErrorStatusCta(status: ErrorStatusCode): ErrorStatusCta {
    switch (status) {
        case 401:
            return { href: '/login', label: 'Go to login' };
        case 403:
            return { href: '/', label: 'Go to homepage' };
        case 404:
            return { href: '/', label: 'Browse blog' };
        case 422:
            return { href: window.location.pathname, label: 'Retry submission' };
        case 500:
            return { href: '/', label: 'Back to safety' };
        case 419:
        case 429:
            return { href: '/', label: 'Go to homepage' };
    }
}

