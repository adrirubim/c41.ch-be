# Contributing

This is an open-source project (MIT). For contributions or inquiries, please contact the author (see [README](README.md#-author)).

## Code standards

- **PHP:** PSR-12, Laravel conventions, Laravel Pint
- **Frontend:** TypeScript, ESLint, Prettier
- **Tests:** Write or update tests for new features
- **Docs:** Keep code comments and docblocks in English

## Development workflow

1. Clone the repo and follow [Installation](README.md#-installation).
2. Create a branch from `main` or `develop`.
3. Run tests: `php artisan test`
4. Run lint and type check: `vendor/bin/pint`, `npm run format`, `npm run lint`, `npm run types`
5. Open a Pull Request; CI will run tests and lint automatically.
