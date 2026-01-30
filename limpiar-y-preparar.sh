#!/bin/bash

# Script para limpiar y preparar el proyecto para producción

echo "🧹 Limpiando vendor corrupto..."
rm -rf vendor/

echo "📦 Reinstalando dependencias de producción..."
composer install --optimize-autoloader --no-dev

echo "⚡ Optimizando Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Proyecto listo para producción!"
