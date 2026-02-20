# Test Database

How to run tests and configure the test database for **c41.ch-be**.

## Default: SQLite in-memory

By default, tests use **SQLite** with an in-memory database (`:memory:`). No setup is required:

```bash
php artisan test
```

This is defined in `phpunit.xml` (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`). Use this for local development when you don't need PostgreSQL.

## Optional: PostgreSQL (match CI)

CI (GitHub Actions) runs tests against **PostgreSQL** with database `c41_test`. To run the same locally:

1. **Create the test database** (once):

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE c41_test OWNER postgres;"
   ```

   Or use the script: `CREATE_TEST_DATABASE.sql` (see root of the repo).

2. **Run tests with PostgreSQL env**:

   ```bash
   DB_CONNECTION=pgsql DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test
   ```

3. **Optional:** override in `phpunit.xml` or a local `.env.testing` if you always want to use PostgreSQL for tests.

## CI configuration

In `.github/workflows/tests.yml`, the test database is configured as follows:

- **Service:** `postgres:16`
- **Database:** `c41_test`
- **User / password:** `postgres` / `postgres`
- **Port:** `5432`

Migrations are applied automatically via Laravel's `RefreshDatabase` trait in tests.

## Summary

| Environment | DB          | Config / command |
|-------------|-------------|------------------|
| Local (default) | SQLite `:memory:` | `php artisan test` |
| Local (PostgreSQL) | `c41_test` | `DB_CONNECTION=pgsql DB_DATABASE=c41_test DB_USERNAME=postgres DB_PASSWORD=postgres php artisan test` |
| CI (GitHub Actions) | PostgreSQL `c41_test` | Set in workflow; no extra step |
