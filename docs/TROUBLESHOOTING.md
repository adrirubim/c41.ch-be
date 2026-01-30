# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the C41.ch Backend application.

## 📋 Table of Contents

- [General Troubleshooting](#general-troubleshooting)
- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Permission Issues](#permission-issues)
- [Application Errors](#application-errors)
- [Frontend Issues](#frontend-issues)
- [Performance Issues](#performance-issues)
- [Queue Worker Issues](#queue-worker-issues)
- [Cache Issues](#cache-issues)
- [Email Issues](#email-issues)
- [Development Environment](#development-environment)

---

## General Troubleshooting

### Check Application Logs

```bash
# View Laravel logs
tail -f storage/logs/laravel.log

# View specific error
grep -i error storage/logs/laravel.log

# View last 100 lines
tail -n 100 storage/logs/laravel.log
```

### Clear All Caches

```bash
php artisan optimize:clear
```

This clears:
- Configuration cache
- Route cache
- View cache
- Application cache
- Compiled classes

### Check Environment Configuration

```bash
# Verify .env file exists
ls -la .env

# Check key environment variables
php artisan tinker
>>> config('app.env')
>>> config('app.debug')
```

---

## Installation Issues

### Composer Installation Fails

**Problem**: `composer install` fails with memory or timeout errors.

**Solutions**:

```bash
# Increase memory limit
php -d memory_limit=-1 /usr/local/bin/composer install

# Or set in php.ini
memory_limit = -1

# Use --no-dev for production
composer install --no-dev --optimize-autoloader
```

### NPM Installation Fails

**Problem**: `npm install` fails or takes too long.

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Use npm ci instead of npm install
npm ci

# Check Node.js version (should be 18+)
node --version
```

### Missing PHP Extensions

**Problem**: Application fails with "Class not found" or extension errors.

**Solutions**:

```bash
# Check installed extensions
php -m

# Install missing extensions (Ubuntu/Debian)
sudo apt-get install php8.2-pgsql php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-gd

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## Database Issues

### Connection Refused

**Problem**: `SQLSTATE[08006] [7] could not connect to server`

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify credentials in `.env`**:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=c41
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

3. **Test connection**:
   ```bash
   psql -U postgres -d c41 -h 127.0.0.1
   ```

### Migration Errors

**Problem**: Migrations fail with errors.

**Solutions**:

```bash
# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Fresh migration (WARNING: deletes all data)
php artisan migrate:fresh --seed
```

### Foreign Key Constraint Errors

**Problem**: `SQLSTATE[23503]: Foreign key violation`

**Solutions**:

1. Check data integrity in database
2. Ensure related records exist before creating foreign keys
3. Review migration order

---

## Permission Issues

### Storage Directory Not Writable

**Problem**: `The stream or file could not be opened: failed to open stream: Permission denied`

**Solutions**:

```bash
# Set correct ownership
sudo chown -R www-data:www-data storage bootstrap/cache

# Set correct permissions
sudo chmod -R 775 storage bootstrap/cache

# For development (less secure)
chmod -R 777 storage bootstrap/cache
```

### Log File Permission Errors

**Problem**: Cannot write to log files.

**Solutions**:

```bash
# Create log file if missing
touch storage/logs/laravel.log

# Set permissions
chmod 664 storage/logs/laravel.log
chown www-data:www-data storage/logs/laravel.log
```

### Storage Link Issues

**Problem**: `storage:link` fails or images don't load.

**Solutions**:

```bash
# Remove existing link
rm public/storage

# Create new link
php artisan storage:link

# Verify link exists
ls -la public/storage
```

---

## Application Errors

### 500 Internal Server Error

**Problem**: Application returns 500 error.

**Solutions**:

1. **Check logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Clear caches**:
   ```bash
   php artisan optimize:clear
   ```

3. **Check `.env` file**:
   ```bash
   php artisan config:clear
   ```

4. **Verify APP_KEY**:
   ```bash
   php artisan key:generate
   ```

5. **Check file permissions** (see Permission Issues)

### Route Not Found (404)

**Problem**: Routes return 404.

**Solutions**:

```bash
# Clear route cache
php artisan route:clear

# List all routes
php artisan route:list

# Rebuild route cache
php artisan route:cache
```

### CSRF Token Mismatch

**Problem**: `419 Page Expired` errors.

**Solutions**:

1. **Clear session cache**:
   ```bash
   php artisan session:clear
   ```

2. **Check session configuration in `.env`**:
   ```env
   SESSION_DRIVER=file
   SESSION_LIFETIME=120
   ```

3. **Verify APP_KEY is set**:
   ```bash
   php artisan key:generate
   ```

### Class Not Found

**Problem**: `Class 'App\...' not found`

**Solutions**:

```bash
# Regenerate autoloader
composer dump-autoload

# Clear compiled classes
php artisan clear-compiled
php artisan optimize:clear
```

---

## Frontend Issues

### Assets Not Loading

**Problem**: CSS/JS files return 404.

**Solutions**:

1. **Rebuild assets**:
   ```bash
   npm run build
   ```

2. **Clear view cache**:
   ```bash
   php artisan view:clear
   ```

3. **Check Vite configuration**:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   ```

### Vite Dev Server Not Starting

**Problem**: `npm run dev` fails.

**Solutions**:

```bash
# Check Node.js version (18+)
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port 5173 is available
lsof -i :5173
```

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:

```bash
# Check types
npm run types

# Fix linting issues
npm run lint

# Check tsconfig.json configuration
cat tsconfig.json
```

---

## Performance Issues

### Slow Page Loads

**Problem**: Application is slow.

**Solutions**:

1. **Enable caching**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

2. **Check database queries**:
   ```php
   // Enable query logging
   DB::enableQueryLog();
   // ... your code ...
   dd(DB::getQueryLog());
   ```

3. **Optimize database**:
   ```sql
   -- PostgreSQL
   VACUUM ANALYZE;
   ```

4. **Check for N+1 queries**:
   - Use eager loading: `Post::with('user', 'categories')->get()`

### High Memory Usage

**Problem**: Application uses too much memory.

**Solutions**:

1. **Increase PHP memory limit** (temporary fix):
   ```ini
   memory_limit = 512M
   ```

2. **Optimize queries**:
   - Use pagination
   - Select only needed columns
   - Use eager loading

3. **Clear caches regularly**

---

## Queue Worker Issues

### Jobs Not Processing

**Problem**: Queue jobs remain in database.

**Solutions**:

1. **Check queue worker is running**:
   ```bash
   # Supervisor
   sudo supervisorctl status

   # Manual
   ps aux | grep queue:work
   ```

2. **Start queue worker**:
   ```bash
   php artisan queue:work
   ```

3. **Check failed jobs**:
   ```bash
   php artisan queue:failed
   ```

### Queue Worker Crashes

**Problem**: Queue worker stops unexpectedly.

**Solutions**:

1. **Check logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Restart worker**:
   ```bash
   # Supervisor
   sudo supervisorctl restart c41-queue:*

   # Manual
   php artisan queue:restart
   ```

3. **Check memory limits**:
   ```bash
   php artisan queue:work --max-time=3600
   ```

---

## Cache Issues

### Stale Cache Data

**Problem**: Changes not reflecting.

**Solutions**:

```bash
# Clear all caches
php artisan optimize:clear

# Clear specific cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Cache Driver Errors

**Problem**: Cache operations fail.

**Solutions**:

1. **Check cache driver in `.env`**:
   ```env
   CACHE_DRIVER=file
   ```

2. **Verify cache directory is writable**:
   ```bash
   ls -la bootstrap/cache
   chmod -R 775 bootstrap/cache
   ```

---

## Email Issues

### Emails Not Sending

**Problem**: Email functionality not working.

**Solutions**:

1. **Check mail configuration in `.env`**:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your_username
   MAIL_PASSWORD=your_password
   MAIL_ENCRYPTION=tls
   ```

2. **Test email sending**:
   ```bash
   php artisan tinker
   >>> Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });
   ```

3. **Check logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## Development Environment

### WSL-Specific Issues

**Problem**: Issues when running in WSL.

**Solutions**:

1. **File permissions**:
   ```bash
   # Use Windows paths
   cd /mnt/c/path/to/project
   ```

2. **Line endings**:
   ```bash
   git config core.autocrlf false
   ```

3. **Port forwarding**:
   - Use `127.0.0.1:8000` instead of `localhost:8000`

### Concurrently Not Working

**Problem**: `composer run dev` fails.

**Solutions**:

```bash
# Install concurrently globally
npm install -g concurrently

# Or run services separately
php artisan serve &
npm run dev &
php artisan queue:listen &
```

### Database Connection in WSL

**Problem**: Cannot connect to PostgreSQL.

**Solutions**:

1. **Use localhost instead of 127.0.0.1**:
   ```env
   DB_HOST=localhost
   ```

2. **Check PostgreSQL is running in WSL**:
   ```bash
   sudo service postgresql start
   ```

---

## Getting Help

If you're still experiencing issues:

1. **Check application logs**: `storage/logs/laravel.log`
2. **Check server logs**: `/var/log/nginx/` or `/var/log/apache2/`
3. **Enable debug mode** (development only):
   ```env
   APP_DEBUG=true
   ```
4. **Review error messages carefully**
5. **Check Laravel documentation**: https://laravel.com/docs
6. **Search GitHub issues** (if applicable)

---

**Last Updated:** January 12, 2026  
**Version:** 1.0
