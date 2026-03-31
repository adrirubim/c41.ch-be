import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { StrictMode } from 'react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

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
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
