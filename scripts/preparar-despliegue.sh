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

echo "🔐 Note: .env is not copied automatically (avoid handling secrets in-repo)."
echo "   Create $DEPLOY_DIR/.env manually from .env.example (or your secret manager)."

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
echo "   - Ready to upload to your hosting web root (or subdirectory)"
echo ""
echo "📤 Next steps:"
echo "   1. Create and verify .env at $DEPLOY_DIR/.env"
echo "   2. Connect FileZilla to CDMON"
echo "   3. Upload ALL content from $DEPLOY_DIR to your hosting target directory"
echo "      - If deploying under a subdirectory, set VITE_BASE accordingly (e.g. /cp3/activitat_39/) and build assets in that environment"
echo "   4. Set permissions: storage/ and bootstrap/cache/ → 775"
echo ""
