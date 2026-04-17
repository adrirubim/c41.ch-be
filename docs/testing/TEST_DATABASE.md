# Test Database

How to run tests and configure the test database for **c41.ch-be**.

## Build frontend assets (Vite manifest)

Feature tests depend on the Vite/Inertia manifest. CI generates this automatically, but locally make sure to build the assets before running the test suite:

```bash
npm run build:frontend
```

## Default: SQLite in-memory

By default, tests use **SQLite** with an in-memory database (`:memory:`). No setup is required:

```bash
php artisan test
```

This is defined in `phpunit.xml` (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`). Use this for local development when you don't need PostgreSQL.

If you see `could not find driver` when running tests, you are missing the SQLite PDO extension (`pdo_sqlite/sqlite3`, package `php8.4-sqlite3` on Ubuntu/Debian).

## Optional: PostgreSQL (match CI)

CI (GitHub Actions) runs tests against **PostgreSQL** with database `c41_test`. To run the same locally:

1. **Create the test database** (once):

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE c41_test OWNER postgres;"
   ```

   Or use the script: `docs/testing/CREATE_TEST_DATABASE.sql`.

2. **Run tests with PostgreSQL env**:

   ```bash
   DB_CONNECTION=pgsql DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test
   ```

3. **Optional:** override in `phpunit.xml` or a local `.env.testing` if you always want to use PostgreSQL for tests.

## Optional: PostgreSQL via Docker (ephemeral, like CI)

If you don't have PostgreSQL local configured (or the `postgres` user/password differs), you can run the same database as CI with an ephemeral Docker container.

This is also what `./scripts/dev-verify.sh` uses when you set `USE_PG_FOR_TESTS=1` (or when SQLite is not available locally).

```bash
docker rm -f c41_test_pg >/dev/null 2>&1 || true
docker run -d --name c41_test_pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=c41_test -p 5433:5432 postgres:16
for i in {1..30}; do docker exec c41_test_pg pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done

DB_CONNECTION=pgsql DB_HOST=127.0.0.1 DB_PORT=5433 DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test

docker rm -f c41_test_pg >/dev/null 2>&1 || true
```

## CI configuration

In `.github/workflows/tests.yml`, the test database is configured as follows:

- **Service:** `postgres:16`
- **Database:** `c41_test`
- **User / password:** `postgres` / `postgres`
- **Port:** `5432`

Migrations are applied automatically via Laravel's `RefreshDatabase` trait in tests.

## Summary

| Environment | DB | Config / command |
|-------------|----|------------------|
| Local (default) | SQLite `:memory:` | `php artisan test` |
| Local (PostgreSQL) | `c41_test` | `DB_CONNECTION=pgsql DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test` |
| Local (PostgreSQL via Docker) | `c41_test` | `DB_CONNECTION=pgsql DB_HOST=127.0.0.1 DB_PORT=5433 DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test` |
| CI (GitHub Actions) | PostgreSQL `c41_test` | Set in workflow; no extra step |

