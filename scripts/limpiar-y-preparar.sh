#!/bin/bash

# Script to clean and prepare the project for production

echo "🧹 Removing potentially corrupted vendor directory..."
rm -rf vendor/

echo "📦 Reinstalling production dependencies..."
composer install --optimize-autoloader --no-dev

echo "⚡ Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Project ready for production!"
