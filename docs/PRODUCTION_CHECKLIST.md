# Production Checklist

Operational checklist for deploying and maintaining `c41.ch-be` in production.

## Pre-flight (before deploy)

- **Environment**
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_KEY` generated and stored securely
  - Database credentials set (`DB_*`)
  - Cache store configured (`CACHE_STORE`) (Redis recommended when available)
- **Build**
  - PHP deps installed with `--no-dev` and optimized autoloader
  - Frontend assets built (`npm run build:frontend`)
- **Permissions**
  - `storage/` and `bootstrap/cache/` writable by the runtime user

## Deploy steps (safe procedure)

- (Optional) maintenance mode: `php artisan down`
- Install/refresh deps: `composer install --no-dev --optimize-autoloader`
- Build assets (if not prebuilt): `npm ci && npm run build:frontend`
- Run migrations: `php artisan migrate --force`
- Warm caches: `php artisan optimize && php artisan view:cache`
- (If used) restart queue workers
- Exit maintenance mode: `php artisan up`

## Health checks

- Framework health: `GET /up` → `200`
- Infra health: `GET /api/health` → `200` with JSON `{ ok: true, request_id, checks: { db, cache, media } }`
- Public pages:
  - `GET /`
  - `GET /blog` and `GET /blog/{slug}`
  - `GET /categories` and `GET /categories/{slug}`
  - `GET /sitemap.xml`

If `GET /api/health` returns `503`, inspect `storage/logs/laravel.log` and correlate via `request_id`.

## Scheduler & maintenance

This repository schedules ops commands in `bootstrap/app.php`:

- Daily DB backup (02:00): `php artisan app:db-backup`
  - Writes compressed dumps to `storage/app/backups/db/`
- Weekly media cleanup (Sunday 03:00): `php artisan app:media-cleanup`
  - Deletes orphan directories under `storage/app/public/media/`

Ensure the scheduler is executed every minute:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

## Docker (production-like smoke check)

Use `docker-compose.yml` as a production-like smoke test:

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec app php artisan key:generate
curl -fsS http://localhost:8080/up
curl -fsS http://localhost:8080/api/health
```

## Security verification

- Security headers/CSP are set by `App\Http\Middleware\SecurityHeadersMiddleware` (avoid duplicating CSP at the web server level).
- Rate limiting is enabled and routes apply `throttle:*` middlewares as documented in `docs/SECURITY_MODEL.md`.

## Rollback readiness

- A recent database backup exists and is retrievable (ideally synced offsite).
- You have a rollback strategy for code + migrations (when applicable).

