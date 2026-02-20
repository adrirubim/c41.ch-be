# What to Commit (and What Not)

Guidelines for what belongs in version control and what should stay local or be ignored.

## Do commit

- **Application code:** `app/`, `config/`, `database/migrations`, `database/seeders`, `routes/`, `resources/` (except build artifacts)
- **Tests:** `tests/`
- **Documentation:** `README.md`, `docs/`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, root `*.md` and `*.sql` (e.g. `CREATE_TEST_DATABASE.sql`)
- **Config templates:** `.env.example`, `phpunit.xml`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.editorconfig`, `.gitattributes`, `.gitignore`
- **Lock files:** `composer.lock`, `package-lock.json` (so CI and others get the same versions)
- **Scripts:** `scripts/`, root scripts (e.g. `merge-dependabot-prs.sh`, `update-license-year.sh` in scripts)
- **GitHub:** `.github/workflows/`, issue/PR templates if any

## Do not commit

- **Environment and secrets:** `.env`, `.env.backup`, `.env.production`, `.env.*.local` (use `.env.example` as template only)
- **Dependencies:** `vendor/`, `node_modules/`
- **Build output:** `public/build/`, `public/hot`, `bootstrap/ssr`, generated wayfinder files under `resources/js/` if listed in `.gitignore`
- **Storage and cache:** `storage/*.key`, `.phpunit.cache`, `.phpunit.result.cache`
- **Credentials:** `auth.json` (Composer), API keys, passwords, signing keys
- **IDE/project-specific:** `.idea/`, `.vscode/`, `.nova/`, etc. (unless the team standardizes one)
- **Archives and backups:** `*.tar.gz` (e.g. vendor backups) unless they are intentional release artifacts

## Before pushing

1. Run `composer install` and `npm install` (or `npm ci`) so lock files are up to date if you changed dependencies.
2. Run lint and tests (see README “Before Pushing to GitHub”): e.g. `./vendor/bin/pint`, `npm run format`, `npm run lint`, `npm run types`, `npm run build`, `php artisan test`.
3. Ensure no `.env` or secrets are staged; keep `.env` in `.gitignore`.

## Policy

- **Never** commit real credentials, API keys, or production `.env`.
- When in doubt, keep it out of the repo and document the requirement in `README` or `docs/` (e.g. “set `FOO` in `.env`”).
