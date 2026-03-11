#!/bin/bash

# Script to prepare the project for production
# Usage: bash prepare-production.sh

set -e

echo "🚀 Preparing project for production..."
echo ""

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Compile assets
echo -e "${YELLOW}📦 Compiling assets for production...${NC}"
npm run build
echo -e "${GREEN}✅ Assets compiled${NC}"
echo ""

# 2. Clear Laravel caches
echo -e "${YELLOW}🧹 Clearing Laravel caches...${NC}"
php artisan optimize:clear
echo -e "${GREEN}✅ Caches cleared${NC}"
echo ""

# 3. Optimize Laravel
echo -e "${YELLOW}⚡ Optimizing Laravel application...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✅ Application optimized${NC}"
echo ""

# 4. Clean temporary and unnecessary files
echo -e "${YELLOW}🗑️  Cleaning temporary files...${NC}"

# Temporary files to delete (these paths are historical placeholders)
TEMP_FILES=(
    "an db table category_post"
    "an tinker"
    "t = AppModelsPost first();"
    "t = Post first();"
)

for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        rm -rf "$file"
        echo "  Removed: $file"
    fi
done

# Clean log files (optional, commented out for safety)
# echo "  Cleaning old logs..."
# find storage/logs -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

echo -e "${GREEN}✅ Temporary files cleaned${NC}"
echo ""

# 5. Verify structure
echo -e "${YELLOW}🔍 Verifying project structure...${NC}"

REQUIRED_FILES=(
    "index.php"
    ".htaccess"
    "artisan"
    "composer.json"
    "vite.config.ts"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required files are present${NC}"
else
    echo -e "${RED}❌ Missing files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
fi

echo ""

# 6. Verify compiled assets
if [ -d "public/build" ] && [ -f "public/build/manifest.json" ]; then
    echo -e "${GREEN}✅ Compiled assets found in public/build/${NC}"
else
    echo -e "${RED}❌ Warning: Assets not found in public/build/${NC}"
fi

echo ""
echo -e "${GREEN}✨ Production preparation completed!${NC}"
echo ""
echo "📋 Files ready to upload:"
echo "  - index.php (root)"
echo "  - .htaccess (root)"
echo "  - app/"
echo "  - bootstrap/"
echo "  - config/"
echo "  - database/"
echo "  - public/ (includes build/)"
echo "  - resources/"
echo "  - routes/"
echo "  - storage/"
echo "  - vendor/"
echo "  - artisan"
echo "  - composer.json"
echo "  - composer.lock"
echo "  - .env (configured for production)"
echo ""
echo "❌ DO NOT upload:"
echo "  - node_modules/"
echo "  - .git/"
echo "  - tests/"
echo "  - docs/ (optional)"
echo "  - workflows/"
echo ""
