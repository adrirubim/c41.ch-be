#!/bin/bash

# Script para preparar el proyecto para producción
# Uso: bash prepare-production.sh

set -e

echo "🚀 Preparando proyecto para producción..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Compilar assets
echo -e "${YELLOW}📦 Compilando assets para producción...${NC}"
npm run build
echo -e "${GREEN}✅ Assets compilados${NC}"
echo ""

# 2. Limpiar cachés de Laravel
echo -e "${YELLOW}🧹 Limpiando cachés de Laravel...${NC}"
php artisan optimize:clear
echo -e "${GREEN}✅ Cachés limpiados${NC}"
echo ""

# 3. Optimizar Laravel
echo -e "${YELLOW}⚡ Optimizando aplicación Laravel...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✅ Aplicación optimizada${NC}"
echo ""

# 4. Limpiar archivos temporales e innecesarios
echo -e "${YELLOW}🗑️  Limpiando archivos temporales...${NC}"

# Archivos temporales a eliminar
TEMP_FILES=(
    "an db table category_post"
    "an tinker"
    "t = AppModelsPost first();"
    "t = Post first();"
)

for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        rm -rf "$file"
        echo "  Eliminado: $file"
    fi
done

# Limpiar archivos de log (opcional, comentado por seguridad)
# echo "  Limpiando logs antiguos..."
# find storage/logs -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

echo -e "${GREEN}✅ Archivos temporales limpiados${NC}"
echo ""

# 5. Verificar estructura
echo -e "${YELLOW}🔍 Verificando estructura del proyecto...${NC}"

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
    echo -e "${GREEN}✅ Todos los archivos requeridos están presentes${NC}"
else
    echo -e "${RED}❌ Archivos faltantes:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
fi

echo ""

# 6. Verificar assets compilados
if [ -d "public/build" ] && [ -f "public/build/manifest.json" ]; then
    echo -e "${GREEN}✅ Assets compilados encontrados en public/build/${NC}"
else
    echo -e "${RED}❌ Advertencia: Assets no encontrados en public/build/${NC}"
fi

echo ""
echo -e "${GREEN}✨ Preparación para producción completada!${NC}"
echo ""
echo "📋 Archivos listos para subir:"
echo "  - index.php (raíz)"
echo "  - .htaccess (raíz)"
echo "  - app/"
echo "  - bootstrap/"
echo "  - config/"
echo "  - database/"
echo "  - public/ (incluye build/)"
echo "  - resources/"
echo "  - routes/"
echo "  - storage/"
echo "  - vendor/"
echo "  - artisan"
echo "  - composer.json"
echo "  - composer.lock"
echo "  - .env (configurado para producción)"
echo ""
echo "❌ NO subir:"
echo "  - node_modules/"
echo "  - .git/"
echo "  - tests/"
echo "  - docs/ (opcional)"
echo "  - workflows/"
echo ""
