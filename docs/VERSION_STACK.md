# Version Stack

Exact versions used in this project (reference for development and CI). Update when upgrading major dependencies.

## Backend

| Component      | Version | Notes                    |
|----------------|---------|--------------------------|
| PHP            | 8.2+    | `php -v`                 |
| Laravel        | ^12.0   | See `composer.lock`      |
| Laravel Fortify| ^1.30   | Authentication           |
| Inertia Laravel| ^2.0    | Server-side adapter      |
| PHPUnit        | ^11.5   | Testing                  |

## Frontend

| Component   | Version | Notes               |
|-------------|---------|---------------------|
| Node.js     | 18+     | CI uses Node 22     |
| React       | ^19.2   | See `package.json`  |
| Inertia React| ^2.3    | Client adapter      |
| TypeScript  | ^5.7    |                     |
| Vite        | ^7.0    | Build tool          |
| Tailwind CSS| ^4.0    | Styling             |
| Radix UI    | various | UI primitives       |
| Tiptap      | ^3.15   | WYSIWYG editor      |

## Database & tools

| Component  | Version |
|-------------|---------|
| PostgreSQL  | 14+     |
| Composer    | 2.x     |
| NPM         | 9+      |
| ESLint      | ^9.17   |
| Prettier    | ^3.8    |
| Laravel Pint| ^1.24   |

For locked versions, run `composer show` and `npm list` in the project root.
