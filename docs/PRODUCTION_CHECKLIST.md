# Production Checklist

## Database migrations (safe procedure)
- Put the app into maintenance mode (optional but recommended): `php artisan down`
- Pull the latest code and install dependencies:
  - `composer install --no-dev --optimize-autoloader`
  - Build frontend assets (if not prebuilt): `npm ci && npm run build:frontend`
- Run migrations:
  - `php artisan migrate --force`
- Warm caches:
  - `php artisan optimize`
  - `php artisan view:cache`
- Bring the app back:
  - `php artisan up`

## Cache operations
- Clear caches: `php artisan optimize:clear`
- Warm caches: `php artisan optimize && php artisan view:cache`

## Health checks
- App basic check: `GET /up`
- Infra check (DB + Cache + Media disk writable): `GET /api/health`
  - Expect `200` and JSON `{ ok: true, ... }`
  - If it returns `503`, inspect `storage/logs/laravel.log` and the `request_id`.

## Docker (production-like smoke check)

If you deploy with containers, you can use the repository's `docker-compose.yml` as a production-like smoke test:

```bash
cp .env.example .env
php artisan key:generate
docker compose up --build
curl -fsS http://localhost:8080/up
curl -fsS http://localhost:8080/api/health
```

## Scheduled maintenance
- Ensure your system cron runs Laravel scheduler every minute:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

- Daily DB backup: `app:db-backup` (02:00)
  - Outputs `.sql.gz` files into `storage/app/backups/db/`
- Weekly orphan media cleanup: `app:media-cleanup` (Sunday 03:00)
  - Deletes unreferenced directories under `storage/app/public/media/`

### Bonus: sync backups to S3
- Option A (recommended): configure an S3 Flysystem disk and write backups directly to it.
- Option B (simple): cron an `aws s3 sync` of `storage/app/backups/`:

```bash
aws s3 sync storage/app/backups s3://YOUR_BUCKET/c41/backups --storage-class STANDARD_IA
```

## Logging (rotation & retention)
- Default stack uses `daily` logs by default.
- Configure retention via env:
  - `LOG_DAILY_DAYS=14` (or `7`)
- Ensure `storage/logs/` is writable by the web user.

## Required environment variables
- **Laravel**
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_KEY=base64:...` (must be set)
  - `APP_URL=https://your-domain.tld`
- **Database** (example)
  - `DB_CONNECTION=mysql|pgsql`
  - `DB_HOST=...`
  - `DB_PORT=...`
  - `DB_DATABASE=...`
  - `DB_USERNAME=...`
  - `DB_PASSWORD=...`
- **Cache**
  - `CACHE_STORE=redis` (recommended)
  - `REDIS_HOST=...`
  - `REDIS_PORT=6379`
  - `REDIS_PASSWORD=...` (if applicable)
- **AI (if enabled)**
  - `SERVICES_AI_ENABLED=false|true`
  - Provider keys must be set in your secret manager (never commit).

