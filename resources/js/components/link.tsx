import { withBasePath } from '@/lib/utils';
import { Link as InertiaLink, InertiaLinkProps } from '@inertiajs/react';
import { forwardRef } from 'react';

/**
 * Componente Link personalizado que automáticamente agrega el prefijo del subdirectorio
 * a todas las rutas. Esto previene errores 404 cuando las rutas no incluyen el prefijo.
 *
 * Uso:
 *   <Link href={login()}>Log in</Link>
 *   <Link href="/dashboard">Dashboard</Link>
 *
 * Ambos funcionarán correctamente con el prefijo del subdirectorio.
 */
export const Link = forwardRef<HTMLAnchorElement, InertiaLinkProps>(
    ({ href, ...props }, ref) => {
        // Si href es undefined o null, pasarlo tal cual
        if (!href) {
            return <InertiaLink ref={ref} href={href} {...props} />;
        }

        // Agregar el prefijo del subdirectorio automáticamente
        const hrefWithBase = withBasePath(href);

        return <InertiaLink ref={ref} href={hrefWithBase} {...props} />;
    },
);

Link.displayName = 'Link';
