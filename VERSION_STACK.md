# Version Stack

Exact versions used in this project (reference for development and CI). Update when upgrading major dependencies.

## Top Stack (quick visibility)

| Layer | Component | Version |
|------|-----------|---------|
| Backend | PHP | 8.4.20 |
| Backend | Laravel | 13.5.0 |
| Frontend | React | 19.2.5 |
| Frontend | TypeScript | 6.0.3 |
| Frontend | Vite | 8.0.9 |
| Database | PostgreSQL | 16.13 |

## Current environment snapshot (April 2026)

Concrete versions captured from a verified local run (WSL). Treat them as reference values; CI and production should stay within the version ranges defined below.

### Backend

- PHP: **8.4.20** (`php -v`)
- Composer: **2.9.5** (`composer -V`)
- Laravel: **13.5.0** (`php artisan --version`)
- PHPUnit: **13.1.7** (`./vendor/bin/phpunit --version`)
- Inertia Laravel: **3.0.6** (`composer show inertiajs/inertia-laravel`)
- Laravel AI: **0.6.0** (`composer show laravel/ai`)
- Laravel Fortify: **1.36.2** (`composer show laravel/fortify`)
- Laravel Wayfinder: **0.1.16** (`composer show laravel/wayfinder`)
- Laravel Tinker: **dev-master** (`composer show laravel/tinker`)
- league/commonmark: **2.8.1** (`composer show league/commonmark`)
- prism-php/prism: **0.100.1** (`composer show prism-php/prism`)

### Frontend

- Node.js (local): **22.22.1** (`node -v`)
- Node.js (CI): **22.x** (see `.github/workflows/*.yml`)
- npm: **11.12.1** (`npm -v`)
- React: **19.2.5** (`npm list react --depth=0`)
- @inertiajs/react: **3.0.3** (`npm list @inertiajs/react --depth=0`)
- TypeScript: **6.0.3** (`npm list typescript --depth=0`)
- Vite: **8.0.9** (`npm list vite --depth=0` / `npx vite -v`)
- @vitejs/plugin-react: **6.0.1** (`npm list @vitejs/plugin-react --depth=0`)
- @rolldown/plugin-babel: **0.2.3** (`npm list @rolldown/plugin-babel --depth=0`)
- @babel/core: **7.29.0** (`npm list @babel/core --depth=0`)
- Tailwind CSS: **4.2.3** (`npm list tailwindcss --depth=0`)

> Note: the project uses `legacy-peer-deps=true` (see `.npmrc`) to allow Vite 8 with the current `@tailwindcss/vite` peer dependency constraints.

### Tooling & quality

- ESLint: **10.2.1** (`npm list eslint --depth=0`)
- Prettier: **3.8.3** (`npm list prettier --depth=0`)
- Laravel Pint: **1.29.1** (`vendor/bin/pint --version`)
- PHPStan: **2.1.50** (`vendor/bin/phpstan --version`)

## Backend

| Component      | Version | Notes                    |
|----------------|---------|--------------------------|
| PHP            | 8.4+    | `php -v`                 |
| Laravel        | ^13.0   | See `composer.lock`      |
| Laravel Fortify| ^1.30   | Authentication           |
| Laravel AI     | ^0.6    | AI SDK                   |
| Inertia Laravel| ^3.0    | Server-side adapter      |
| PHPUnit        | ^13.0   | Testing                  |

> Note: Laravel 13 currently requires `laravel/tinker` 3.x for Illuminate ^13 compatibility. At the time of this snapshot, Tinker 3.x is only available as `3.x-dev` / `dev-master`, so the project pins it explicitly until a stable release is published.

## Frontend

| Component    | Version | Notes               |
|-------------|---------|---------------------|
| Node.js     | 22+     | CI uses Node 22     |
| React       | ^19.2   | See `package.json`  |
| Inertia React| ^3.0    | Client adapter      |
| TypeScript  | ^6.0    |                     |
| Vite        | ^8.0    | Build tool          |
| Tailwind CSS| ^4.2    | Styling             |
| Radix UI    | various | UI primitives       |
| Tiptap      | ^3.20   | WYSIWYG editor      |

## Database & tools

| Component  | Version |
|-------------|---------|
| PostgreSQL  | 16.13   |
| Composer    | 2.x     |
| NPM         | 11+     |
| ESLint      | ^10.0   |
| Prettier    | ^3.8    |
| Laravel Pint| ^1.24   |

### PostgreSQL version check (local)

If `psql -c "select version();"` fails with `FATAL: role "<user>" does not exist`, it means PostgreSQL is running but the default OS username is not a PostgreSQL role.

Use one of these instead:

- `psql -U postgres -c "select version();"`
- Or create a matching role once (example): `sudo -u postgres createuser -s $USER`

For locked versions beyond this snapshot, run `composer show` and `npm list` in the project root.

