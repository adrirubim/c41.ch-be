#!/usr/bin/env bash
set -euo pipefail

echo "==> c41.ch-be – local quality gate"

echo "==> 0/4 Lint / format / types (CI parity)"
vendor/bin/pint
npm run format:check
npm run lint
npm run types

echo "==> 1/4 Composer install (no changes expected if already installed)"
composer install --no-interaction --prefer-dist

echo "==> 2/4 NPM install (ci) and frontend build"
npm ci
npm run build:frontend

echo "==> 3/4 PHP tests (SQLite in-memory, default phpunit.xml)"
php artisan test

if [[ "${USE_PG_FOR_TESTS:-0}" == "1" ]]; then
  echo "==> 4/4 PHP tests against PostgreSQL (ephemeral Docker, like CI)"

  docker rm -f c41_test_pg >/dev/null 2>&1 || true

  docker run -d --name c41_test_pg \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=c41_test \
    -p 5433:5432 postgres:16

  for i in {1..30}; do
    if docker exec c41_test_pg pg_isready -U postgres >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  DB_CONNECTION=pgsql \
  DB_HOST=127.0.0.1 \
  DB_PORT=5433 \
  DB_DATABASE=c41_test \
  DB_USERNAME=postgres \
  DB_PASSWORD=postgres \
  php artisan test

  docker rm -f c41_test_pg >/dev/null 2>&1 || true
else
  echo "==> Skipping PostgreSQL test run (set USE_PG_FOR_TESTS=1 to enable)"
fi

echo "==> Quality gate completed successfully."

