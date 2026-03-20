import { withBasePath } from '@/lib/utils';
import { Link as InertiaLink, InertiaLinkProps } from '@inertiajs/react';
import { forwardRef } from 'react';

/**
 * Custom Link component that automatically adds the subdirectory prefix
 * to all routes. This prevents 404 errors when routes do not include the prefix.
 *
 * Usage:
 *   <Link href={login()}>Log in</Link>
 *   <Link href="/dashboard">Dashboard</Link>
 *
 * Both will work correctly with the subdirectory prefix.
 */
export const Link = forwardRef<HTMLAnchorElement, InertiaLinkProps>(
    ({ href, ...props }, ref) => {
        if (href == null) {
            return <InertiaLink ref={ref} href={href} {...props} />;
        }

        // Pagination helpers sometimes provide absolute URLs (e.g. `http://localhost:8000/...`).
        // If we run those through `withBasePath()`, we end up with invalid paths like
        // `/http://localhost:8000/...`. For any `scheme:` URL (http/https/mailto/tel/...), keep it as-is.
        const hrefString =
            typeof href === 'string'
                ? href
                : typeof href === 'object' &&
                      href !== null &&
                      'url' in href &&
                      typeof href.url === 'string'
                    ? href.url
                    : null;

        if (
            hrefString != null &&
            /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(hrefString)
        ) {
            return <InertiaLink ref={ref} href={href} {...props} />;
        }

        // Automatically add the subdirectory prefix
        const hrefWithBase = withBasePath(href);

        return <InertiaLink ref={ref} href={hrefWithBase} {...props} />;
    },
);

Link.displayName = 'Link';
