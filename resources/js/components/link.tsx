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

        // Automatically add the subdirectory prefix
        const hrefWithBase = withBasePath(href);

        return <InertiaLink ref={ref} href={hrefWithBase} {...props} />;
    },
);

Link.displayName = 'Link';
