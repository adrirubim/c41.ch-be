import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Agrega el prefijo del subdirectorio a una ruta si no lo tiene ya.
 * Usa BASE_URL de Vite para obtener el prefijo correcto.
 * Maneja strings, objetos de Inertia, y valores undefined/null.
 */
export function withBasePath(
    path: string | { url?: string } | undefined | null,
): string {
    // Si es undefined o null, devolver el basePath solo
    if (!path) {
        return import.meta.env.BASE_URL || '/';
    }

    // Si es un objeto (como los href de Inertia), extraer la URL
    const pathString = typeof path === 'string' ? path : path.url || '/';

    // Si no es un string válido, devolver el basePath
    if (typeof pathString !== 'string') {
        return import.meta.env.BASE_URL || '/';
    }

    const basePath = import.meta.env.BASE_URL || '/';

    // Si la ruta ya empieza con el basePath, devolverla tal cual
    if (pathString.startsWith(basePath)) {
        return pathString;
    }

    // Si la ruta empieza con /, agregar el basePath (sin el / final)
    if (pathString.startsWith('/')) {
        const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        return base + pathString;
    }

    // Si no empieza con /, agregar basePath + /
    return basePath + pathString;
}
