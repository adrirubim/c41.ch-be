# Deployment Guide

This guide covers deploying the `c41.ch-be` application to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Steps](#deployment-steps)
- [Server Configuration](#server-configuration)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Optimization](#optimization)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Queue Workers](#queue-workers)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Shared Hosting / CDMON (No SSH)](#shared-hosting--cdmon-no-ssh)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Server with SSH access
- ✅ Domain name configured (optional but recommended)
- ✅ PostgreSQL database server
- ✅ PHP 8.4+ installed
- ✅ Composer 2.0+ installed
- ✅ Node.js 22+ and NPM 10+ installed
- ✅ Git installed
- ✅ Basic knowledge of server administration

---

## Server Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+

### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 4GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

### Software Stack

- **Web Server**: Nginx 1.18+ or Apache 2.4+
- **PHP**: 8.4+ with extensions:
  - `php-fpm`
  - `php-pgsql` or `php-pdo-pgsql`
  - `php-mbstring`
  - `php-xml`
  - `php-curl`
  - `php-zip`
  - `php-gd`
  - `php-fileinfo`
- **Database**: PostgreSQL 14+
- **Process Manager**: Supervisor (for queue workers)
- **SSL**: Let's Encrypt (recommended)

---

## Pre-Deployment Checklist

- [ ] Code is tested and all tests pass (`php artisan test`) (default: SQLite in-memory; PostgreSQL/CI via `docs/testing/TEST_DATABASE.md`)
- [ ] Frontend assets are built (`npm run build:frontend`)
- [ ] Environment variables are configured
- [ ] Database migrations are ready
- [ ] Storage directory is writable
- [ ] SSL certificate is obtained (if using HTTPS)
- [ ] Domain DNS is configured
- [ ] Backup strategy is in place
- [ ] Monitoring is configured

---

## Deployment Steps

### 1. Clone Repository

```bash
cd /var/www
git clone <repository-url> c41.ch-be
cd c41.ch-be
```

### 2. Install Dependencies

```bash
# Install PHP dependencies (production, no dev)
composer install --optimize-autoloader --no-dev

# Install Node dependencies
npm ci

# Build frontend assets (Vite manifest for Laravel)
npm run build:frontend
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Environment Variables

Edit `.env` file with production values (see [Environment Configuration](#environment-configuration)).

### 5. Set Permissions

```bash
# Set ownership (adjust user/group as needed)
sudo chown -R www-data:www-data /var/www/c41.ch-be

# Set directory permissions
sudo find /var/www/c41.ch-be -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/c41.ch-be -type f -exec chmod 644 {} \;

# Make storage and bootstrap/cache writable
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

### 6. Run Migrations

```bash
# Run migrations
php artisan migrate --force

# Seed database (optional, only for initial setup)
php artisan db:seed --force
```

### 7. Create Storage Link

```bash
php artisan storage:link
```

### 8. Optimize Application

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

---

## Server Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/c41.ch-be`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    root /var/www/c41.ch-be/public;
    index index.php index.html;

    charset utf-8;

    # Logging
    access_log /var/log/nginx/c41.ch-be-access.log;
    error_log /var/log/nginx/c41.ch-be-error.log;

    # Security headers
    #
    # This application sets the authoritative security headers (including CSP)
    # in `App\Http\Middleware\SecurityHeadersMiddleware`.
    #
    # Keep server-level headers minimal to avoid mismatches or double policies.
    # (You may still add server-level hardening such as HSTS after HTTPS is enabled.)

    # Main location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Deny access to sensitive files
    location ~ /\.(env|git|svn) {
        deny all;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/c41.ch-be /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache Configuration

If using Apache, create `/etc/apache2/sites-available/c41.ch-be.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    DocumentRoot /var/www/c41.ch-be/public

    <Directory /var/www/c41.ch-be/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/c41.ch-be-error.log
    CustomLog ${APACHE_LOG_DIR}/c41.ch-be-access.log combined
</VirtualHost>
```

Enable the site:

```bash
sudo a2ensite c41.ch-be.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

---

## Environment Configuration

### Production `.env` Settings

```env
APP_NAME="C41.ch Backend"
APP_ENV=production
APP_KEY=base64:... # Generated by php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=c41_production
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Security Checklist

- ✅ `APP_DEBUG=false` in production
- ✅ `APP_ENV=production`
- ✅ Strong `APP_KEY` generated
- ✅ Secure database credentials
- ✅ HTTPS enabled (see SSL section)
- ✅ File permissions set correctly
- ✅ `.env` file is not publicly accessible

---

## Database Setup

### Create Production Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE c41_production;
CREATE USER c41_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE c41_production TO c41_user;
\q
```

### Run Migrations

```bash
php artisan migrate --force
```

### Seed Initial Data (Optional)

```bash
php artisan db:seed --force
```

---

## Optimization

### Application Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize --classmap-authoritative
```

### Frontend Optimization

```bash
# Build production assets (Vite)
npm run build:frontend
```

### Database Optimization

- Ensure indexes are created (check migrations)
- Regular `VACUUM` and `ANALYZE` on PostgreSQL
- Monitor query performance

### PHP-FPM Optimization

Edit the PHP-FPM pool config (example for PHP 8.4 on Ubuntu/Debian): `/etc/php/8.4/fpm/pool.d/www.conf`.

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already configured by Certbot)
sudo certbot renew --dry-run
```

### Update Nginx Configuration

After SSL setup, update your Nginx config to redirect HTTP to HTTPS (uncomment the redirect line in the Nginx config above).

### Update `.env`

```env
APP_URL=https://your-domain.com
```

---

## Queue Workers

### Using Supervisor

Create `/etc/supervisor/conf.d/c41-queue.conf`:

```ini
[program:c41-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/c41.ch-be/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/c41.ch-be/storage/logs/queue-worker.log
stopwaitsecs=3600
```

Start Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start c41-queue:*
```

### Manual Queue Worker (Not Recommended)

```bash
php artisan queue:work --daemon
```

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# Application logs
tail -f storage/logs/laravel.log

# Queue worker logs
tail -f storage/logs/queue-worker.log

# Nginx logs
tail -f /var/log/nginx/c41.ch-be-error.log
```

### Regular Maintenance Tasks

```bash
# Clear expired cache
php artisan cache:clear

# Clear expired sessions
php artisan session:gc

# Optimize database
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Backup Strategy

This repository ships with two production-oriented Artisan commands (defined in `routes/console.php`) and schedules them in `bootstrap/app.php`:

1. **Database backups (compressed)**
   ```bash
   php artisan app:db-backup
   ```
   - Writes `.sql.gz` dumps to `storage/app/backups/db/`
   - Supports `sqlite`, `mysql`, and `pgsql` (uses native dump tools when applicable)

2. **Orphan media cleanup**
   ```bash
   php artisan app:media-cleanup
   ```
   - Deletes unreferenced directories under `storage/app/public/media/` for posts and categories

3. **Offsite sync (recommended)**
   - Sync `storage/app/backups/` to an external location (S3, rsync target, etc.)

### Health Checks

- Monitor application logs for errors
- Infra endpoint: `GET /api/health` (expects `200` and JSON `{ ok: true, request_id, ... }`)
- Check queue worker status: `sudo supervisorctl status`
- Monitor database performance
- Check disk space: `df -h`
- Monitor server resources: `htop` or `top`

---

## Troubleshooting

### Common Issues

#### 500 Internal Server Error

1. Check file permissions
2. Check `.env` configuration
3. Check application logs: `storage/logs/laravel.log`
4. Verify PHP-FPM is running: `sudo systemctl status php8.4-fpm`

#### Permission Denied Errors

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### Database Connection Errors

1. Verify database credentials in `.env`
2. Check PostgreSQL is running: `sudo systemctl status postgresql`
3. Verify database exists and user has permissions

#### Queue Not Processing

1. Check Supervisor status: `sudo supervisorctl status`
2. Check queue worker logs
3. Restart queue workers: `sudo supervisorctl restart c41-queue:*`

#### Assets Not Loading

1. Rebuild assets: `npm run build:frontend`
2. Clear cache: `php artisan optimize:clear`
3. Verify `storage:link` is created: `php artisan storage:link`

---

## Shared Hosting / CDMON (No SSH)

This section explains how to deploy **c41.ch-be** on hosting providers such as **CDMON** where you may not have full SSH access or cannot run `php artisan` directly from a shell.

> For standard VPS or servers with SSH access, use the steps described in [Deployment Steps](#deployment-steps) and below. This section focuses on constrained environments.

### 1. Requirements and limitations

- PHP 8.4+ with `pdo_pgsql` or `pgsql` available.
- Access to a **PostgreSQL** database (you can also use MySQL if you adapt the `.env` and migrations accordingly).
- Ability to upload files via FTP/SFTP or a web file manager.
- Optional but recommended: ability to run **scheduled tasks** (cron).

Because SSH access is limited or unavailable:

- You cannot rely on running `php artisan` in the server shell.
- You should **build assets locally** with `npm run build:frontend` before uploading.
- You may need to use small helper scripts (see `scripts/README.md`) for tasks such as migrations or cache clearing.

### 2. Local build and preparation

On your development machine:

```bash
cd /var/www/c41.ch-be

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci

# Build frontend assets (Vite manifest)
npm run build:frontend
```

This generates the production build under `public/build` (including `manifest.json`), which is required by Laravel’s Vite integration.

### 3. Files to upload

Upload the **entire project** to your hosting account, except for development-only directories:

- Include:
  - `app/`, `bootstrap/`, `config/`, `database/`, `public/`, `resources/`, `routes/`, `storage/`, `vendor/`
  - `.env` (configure directly on the server or via hosting UI — **never commit real secrets to Git**)
- Exclude:
  - `node_modules/`
  - `tests/`
  - `.git/`, `.github/`

> Some providers allow you to configure the **document root** to point to `public/`. If not, use their **“public_html”** (or similar) directory and upload the contents of `public/` there, adjusting paths accordingly.

### 4. Environment configuration (`.env`)

Create or edit `.env` on the server with production values:

```env
APP_NAME="C41.ch Backend"
APP_ENV=production
APP_KEY=base64:...       # Generate locally with php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=c41_production
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

Generate `APP_KEY` **locally** using `php artisan key:generate` and copy the value into the server `.env`.

### 5. Running migrations without SSH

If you cannot run `php artisan migrate` directly:

- Use a **temporary PHP script** that includes `artisan` and calls `migrate --force`.
- Or use the helper scripts described in `scripts/README.md` (for example, a script that bootstraps Laravel and runs the migration command once).

After migrations succeed, delete or protect any script that can execute artisan commands to avoid misuse.

### 6. Caching and optimization

On shared hosting, optimizations like `php artisan config:cache` and `php artisan route:cache` are still useful but must be triggered via helper scripts (similar to migrations) if SSH is not available.

At minimum, ensure:

- `storage/` and `bootstrap/cache/` are writable by the web server user.
- `public/storage` is a valid symlink or a correctly configured directory for uploaded files.

### 7. Vite assets and common issues

Typical problems on CDMON / shared hosting relate to frontend assets:

- **Blank pages or 500 errors** in production often mean the Vite **manifest is missing**.
  - Make sure you ran `npm run build:frontend` locally **before** uploading.
  - Confirm that `public/build/manifest.json` is present on the server.
- If styles or JavaScript do not load:
  - Clear Laravel caches (via helper script): `php artisan optimize:clear`.
  - Verify that the document root points to `public/` (or that your paths match your hosting’s structure).

For additional troubleshooting, see `docs/TROUBLESHOOTING.md`.

### 8. Cron and queues (optional)

If your hosting provider supports cron:

- Configure a job to call `php artisan schedule:run` every minute.
- If you use queues and the provider allows long-running processes, configure a queue worker; otherwise consider using `sync` queue driver in `.env` for simplicity.

---

## Deployment Script Example

Create `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "Deploying application..."

# Pull latest code
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci
npm run build:frontend

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo supervisorctl restart c41-queue:*
sudo systemctl reload php8.4-fpm
sudo systemctl reload nginx

echo "Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## Post-Deployment Verification

- [ ] Application loads correctly
- [ ] All routes work
- [ ] Database connections work
- [ ] File uploads work
- [ ] Queue workers are processing jobs
- [ ] SSL certificate is valid
- [ ] Performance is acceptable
- [ ] Logs are being written correctly

---

**Last Updated:** March 2026  
**Version:** 1.0
