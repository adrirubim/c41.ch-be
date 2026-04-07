#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

# Production optimizations (safe to run repeatedly)
php artisan optimize || true
php artisan view:cache || true

exec "$@"

