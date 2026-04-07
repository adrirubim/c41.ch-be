import { AppErrorBoundary } from '#app/components/error-boundary';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import type { ComponentType } from 'react';
import ReactDOMServer from 'react-dom/server';

const appName: string =
    typeof import.meta.env.VITE_APP_NAME === 'string' &&
    import.meta.env.VITE_APP_NAME.trim() !== ''
        ? import.meta.env.VITE_APP_NAME
        : 'C41.ch Blog';

const pages = import.meta.glob('./pages/**/*.tsx');

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
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
        setup: ({ App, props }) => {
            return (
                <AppErrorBoundary>
                    <App {...props} />
                </AppErrorBoundary>
            );
        },
    }),
);
