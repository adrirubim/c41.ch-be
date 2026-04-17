import '../css/app.css';

import { AppErrorBoundary } from '#app/components/error-boundary';
import type { User } from '#app/types';
import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

type InertiaSharedProps = {
    requestId?: string;
    auth?: {
        user?: User | null;
    };
};

const appName: string =
    typeof import.meta.env.VITE_APP_NAME === 'string' &&
    import.meta.env.VITE_APP_NAME.trim() !== ''
        ? import.meta.env.VITE_APP_NAME
        : 'C41.ch Blog';

const pages = import.meta.glob('./pages/**/*.tsx');

createInertiaApp({
    title: (title) =>
        typeof title === 'string' && title.trim() !== ''
            ? `${title} - ${appName}`
            : appName,
    resolve: (name) => {
        const path = `./pages/${name}.tsx`;
        const loader = pages[path];

        if (typeof loader !== 'function') {
            throw new Error(`Page not found: ${path}`);
        }

        return (
            loader as () => Promise<{ default: ComponentType<unknown> }>
        )().then((mod) => mod.default);
    },
    setup({ el, App, props }) {
        const pageProps = props.initialPage?.props as unknown as
            | InertiaSharedProps
            | undefined;

        const requestId =
            typeof pageProps?.requestId === 'string'
                ? pageProps.requestId
                : null;
        const user = (pageProps?.auth?.user as User | null | undefined) ?? null;

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <AppErrorBoundary requestId={requestId} user={user}>
                    <App {...props} />
                </AppErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: '#0ea5e9',
        showSpinner: false,
    },
});

// This will set light / dark mode on load...
initializeTheme();
