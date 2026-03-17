# Version Stack

Exact versions used in this project (reference for development and CI). Update when upgrading major dependencies.

## Backend

| Component      | Version | Notes                    |
|----------------|---------|--------------------------|
| PHP            | 8.4+    | `php -v`                 |
| Laravel        | ^13.0   | See `composer.lock`      |
| Laravel Fortify| ^1.30   | Authentication           |
| Inertia Laravel| ^2.0    | Server-side adapter      |
| PHPUnit        | ^13.0   | Testing                  |

> Note: Laravel 13 currently requires `laravel/tinker` 3.x for Illuminate ^13 compatibility. At the time of this snapshot, Tinker 3.x is only available as `3.x-dev` / `dev-master`, so the project pins it explicitly until a stable release is published.

## Frontend

| Component    | Version | Notes               |
|-------------|---------|---------------------|
| Node.js     | 22+     | CI uses Node 22     |
| React       | ^19.2   | See `package.json`  |
| Inertia React| ^2.3    | Client adapter      |
| TypeScript  | ^5.9    |                     |
| Vite        | ^7.3    | Build tool          |
| Tailwind CSS| ^4.2    | Styling             |
| Radix UI    | various | UI primitives       |
| Tiptap      | ^3.20   | WYSIWYG editor      |

## Database & tools

| Component  | Version |
|-------------|---------|
| PostgreSQL  | 14+     |
| Composer    | 2.x     |
| NPM         | 10+     |
| ESLint      | ^10.0   |
| Prettier    | ^3.8    |
| Laravel Pint| ^1.29   |

## Current environment snapshot (March 2026)

These are the concrete versions currently used in the primary development environment. Treat them as reference values; CI and production should stay within the version ranges defined above.

### Backend

- PHP: **8.4.1** (`php -v`)
- Laravel: **13.0.0** (`php artisan --version`)
- PHPUnit: **13.0.5** (`./vendor/bin/phpunit --version`)
- Inertia Laravel: **2.0.22** (`composer show inertiajs/inertia-laravel`)
- Tinker: **dev-master** (`composer show laravel/tinker`)

### Frontend

- Node.js (local): **22.22.1** (`node -v`)
- Node.js (CI): **22.x** (see `.github/workflows/*.yml`)
- npm: **10.9.4** (`npm -v`)
- React: **19.2.4** (`npm list react --depth=0`)
- @inertiajs/react: **2.3.18**
- TypeScript: **5.9.3**
- Vite: **7.3.1**
- Tailwind CSS: **4.2.1**
- Tiptap React & extensions: **3.20.4**

### Tooling & quality

- ESLint: **10.0.3**
- Prettier: **3.8.1**
- Laravel Pint: **1.29.0**

For locked versions beyond this snapshot, run `composer show` and `npm list` in the project root.
