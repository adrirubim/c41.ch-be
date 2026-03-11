#!/bin/bash

# Script to prepare a deployment folder with only the essential files

set -e

DEPLOY_DIR="../c41-deploy"
SOURCE_DIR="/var/www/c41.ch-be"

echo "🚀 Preparing deployment folder..."

# Clean deployment folder if it already exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "🧹 Cleaning existing deployment folder..."
    rm -rf "$DEPLOY_DIR"
fi

mkdir -p "$DEPLOY_DIR"

echo "📦 Copying essential files..."

# Files in the project root
cp "$SOURCE_DIR/index.php" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/.htaccess" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/artisan" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/composer.json" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/composer.lock" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/vite.config.ts" "$DEPLOY_DIR/"

# Copy .env from ENV_PRODUCCION_ACTUALIZADO.txt if available
if [ -f "$SOURCE_DIR/ENV_PRODUCCION_ACTUALIZADO.txt" ]; then
    cp "$SOURCE_DIR/ENV_PRODUCCION_ACTUALIZADO.txt" "$DEPLOY_DIR/.env"
    echo "✅ .env copied from ENV_PRODUCCION_ACTUALIZADO.txt"
else
    echo "⚠️  ENV_PRODUCCION_ACTUALIZADO.txt not found. You must create .env manually."
fi

# Copy full directories
echo "📁 Copying directories..."
cp -r "$SOURCE_DIR/app" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/bootstrap" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/config" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/database" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/public" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/resources" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/routes" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/storage" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/vendor" "$DEPLOY_DIR/"

# Clean unnecessary files inside copied directories
echo "🧹 Cleaning unnecessary files..."

# Clean storage (keep structure but delete existing logs if present)
find "$DEPLOY_DIR/storage" -name "*.log" -type f -delete 2>/dev/null || true

# Clean bootstrap/cache (keep structure)
find "$DEPLOY_DIR/bootstrap/cache" -name "*.php" ! -name ".gitignore" -type f -delete 2>/dev/null || true

echo "✅ Deployment folder created at: $DEPLOY_DIR"
echo ""
echo "📋 Summary:"
echo "   - Location: $DEPLOY_DIR"
echo "   - Ready to upload to: /public_html/cp3/activitat_39/"
echo ""
echo "📤 Next steps:"
echo "   1. Verify that .env is correct at $DEPLOY_DIR/.env"
echo "   2. Connect FileZilla to CDMON"
echo "   3. Upload ALL content from $DEPLOY_DIR to /public_html/cp3/activitat_39/"
echo "   4. Set permissions: storage/ and bootstrap/cache/ → 775"
echo ""
