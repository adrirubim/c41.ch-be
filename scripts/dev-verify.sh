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

has_sqlite_driver() {
  php -m 2>/dev/null | tr '[:upper:]' '[:lower:]' | grep -qE '^(pdo_sqlite|sqlite3)$'
}

pg_container_name="c41_test_pg"
pg_port="${C41_TEST_PG_PORT:-5433}"

cleanup_pg() {
  docker rm -f "${pg_container_name}" >/dev/null 2>&1 || true
}

run_pg_tests=0

if has_sqlite_driver; then
  echo "==> 3/4 PHP tests (SQLite in-memory, default phpunit.xml)"
  php artisan test
else
  echo "==> 3/4 Skipping SQLite tests (missing pdo_sqlite/sqlite3 PHP extension)"
  echo "==>     Fix: sudo apt install php8.5-sqlite3 && php -m | grep -iE 'pdo_sqlite|sqlite3'"
  run_pg_tests=1
fi

if [[ "${USE_PG_FOR_TESTS:-0}" == "1" || "${run_pg_tests}" == "1" ]]; then
  echo "==> 4/4 PHP tests against PostgreSQL (ephemeral Docker, like CI)"

  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker is required for PostgreSQL tests, but 'docker' was not found in PATH."
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker daemon is not reachable (is Docker running?)."
    exit 1
  fi

  trap cleanup_pg EXIT
  cleanup_pg

  docker run -d --name "${pg_container_name}" \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=c41_test \
    -p "${pg_port}:5432" postgres:17

  for i in {1..30}; do
    if docker exec "${pg_container_name}" pg_isready -U postgres >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 1
  done
  if [[ "${ready:-0}" != "1" ]]; then
    echo "ERROR: PostgreSQL did not become ready in time."
    docker logs "${pg_container_name}" || true
    exit 1
  fi

  DB_CONNECTION=pgsql \
  DB_HOST=127.0.0.1 \
  DB_PORT="${pg_port}" \
  DB_DATABASE=c41_test \
  DB_USERNAME=postgres \
  DB_PASSWORD=postgres \
  php artisan test
else
  echo "==> Skipping PostgreSQL test run (set USE_PG_FOR_TESTS=1 to enable)"
fi

echo "==> Quality gate completed successfully."

