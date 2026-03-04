# Contributing to c41.ch-be

Thank you for your interest in contributing to c41.ch-be.  
Please read this guide and the main `README` before opening pull requests.

---

## Branching and Workflow

- Clone the repo and follow the installation section in the `README`.
- Create a branch from `main` or `develop`.
- Use clear branch names: `feat/...`, `fix/...`, `chore/...`.

---

## Code Standards

- **Backend (PHP):** PSR-12, Laravel conventions, Laravel Pint.
- **Frontend:** TypeScript, ESLint, Prettier.
- **Tests:** Write or update tests for new features and bug fixes.
- **Docs:** Keep code comments and docblocks in English.

---

## Local Validation (Before Pushing)

Run these checks locally before opening a pull request:

1. **Backend tests**
   - `php artisan test`
2. **Lint and type checks**
   - `vendor/bin/pint`
   - `npm run format`
   - `npm run lint`
   - `npm run types`

CI will run tests and lint automatically on your pull request; local runs should match CI.

---

## Pull Requests

- Open a PR against the appropriate base branch (`main` or `develop`).
- Clearly describe the scope of the change and areas of the codebase touched.
- Ensure all tests and linters pass; CI must be green before merge.
- Link related issues when applicable (for example, `Fixes #123`).

---

## Questions

- For questions or coordination, contact the maintainer (see `README` → Author).
