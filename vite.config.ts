import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import laravel from 'laravel-vite-plugin';
import type { UserConfig } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function normalizeBase(input: string | undefined): string {
    const raw = (input ?? '/').trim();
    if (raw === '') return '/';
    const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
    const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
    return withTrailing;
}

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // `VITE_BASE` represents the app's public base (useful for subdirectory deploys).
    // We only apply it to the dev server (`vite`) because Laravel's Vite integration
    // already sets the correct base for production builds (to serve from `public/build/`).
    const appBase = normalizeBase(env.VITE_BASE);

    const config: UserConfig = {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react(),
            // @vitejs/plugin-react v6 removed Babel options; use a separate Babel plugin.
            babel({
                presets: [reactCompilerPreset()],
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        resolve: {
            alias: {
                '#app': resolve(__dirname, 'resources/js'),
                '@core': resolve(__dirname, 'src/core'),
                '@modules': resolve(__dirname, 'src/modules'),
                '@shared': resolve(__dirname, 'src/shared'),
                '@infra': resolve(__dirname, 'src/infrastructure'),
            },
        },
        build:
            command === 'build'
                ? {
                      // When building to `public/build`, Vite's modulepreload helper uses absolute
                      // `/${dep}` URLs (e.g. `/assets/...`). We must prefix those deps with `build/`
                      // (and optionally a subdirectory base) so preloads resolve to `/build/assets/...`.
                      modulePreload: {
                          resolveDependencies: (_filename: string, deps: string[]) => {
                              const baseNoLeadingSlash = appBase.replace(/^\//, '');
                              const prefix = `${baseNoLeadingSlash}build/`;
                              return deps.map((d) => `${prefix}${d}`);
                          },
                      },
                  }
                : undefined,
    };

    if (command !== 'build') {
        return {
            ...config,
            base: appBase,
        };
    }

    return config;
});
