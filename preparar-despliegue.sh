#!/bin/bash

# Script para preparar carpeta de despliegue con solo archivos esenciales

set -e

DEPLOY_DIR="../c41-deploy"
SOURCE_DIR="/var/www/c41.ch-be"

echo "🚀 Preparando carpeta de despliegue..."

# Limpiar carpeta de despliegue si existe
if [ -d "$DEPLOY_DIR" ]; then
    echo "🧹 Limpiando carpeta de despliegue existente..."
    rm -rf "$DEPLOY_DIR"
fi

mkdir -p "$DEPLOY_DIR"

echo "📦 Copiando archivos esenciales..."

# Archivos en la raíz
cp "$SOURCE_DIR/index.php" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/.htaccess" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/artisan" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/composer.json" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/composer.lock" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/vite.config.ts" "$DEPLOY_DIR/"

# Copiar .env desde ENV_PRODUCCION_ACTUALIZADO.txt
if [ -f "$SOURCE_DIR/ENV_PRODUCCION_ACTUALIZADO.txt" ]; then
    cp "$SOURCE_DIR/ENV_PRODUCCION_ACTUALIZADO.txt" "$DEPLOY_DIR/.env"
    echo "✅ .env copiado desde ENV_PRODUCCION_ACTUALIZADO.txt"
else
    echo "⚠️  ENV_PRODUCCION_ACTUALIZADO.txt no encontrado. Debes crear .env manualmente."
fi

# Copiar carpetas completas
echo "📁 Copiando carpetas..."
cp -r "$SOURCE_DIR/app" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/bootstrap" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/config" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/database" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/public" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/resources" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/routes" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/storage" "$DEPLOY_DIR/"
cp -r "$SOURCE_DIR/vendor" "$DEPLOY_DIR/"

# Limpiar archivos innecesarios dentro de las carpetas copiadas
echo "🧹 Limpiando archivos innecesarios..."

# Limpiar storage (mantener estructura pero eliminar logs antiguos si existen)
find "$DEPLOY_DIR/storage" -name "*.log" -type f -delete 2>/dev/null || true

# Limpiar bootstrap/cache (mantener estructura)
find "$DEPLOY_DIR/bootstrap/cache" -name "*.php" ! -name ".gitignore" -type f -delete 2>/dev/null || true

echo "✅ Carpeta de despliegue creada en: $DEPLOY_DIR"
echo ""
echo "📋 Resumen:"
echo "   - Ubicación: $DEPLOY_DIR"
echo "   - Listo para subir a: /public_html/cp3/activitat_39/"
echo ""
echo "📤 Próximos pasos:"
echo "   1. Revisa que .env esté correcto en $DEPLOY_DIR/.env"
echo "   2. Conecta FileZilla a CDMON"
echo "   3. Sube TODO el contenido de $DEPLOY_DIR a /public_html/cp3/activitat_39/"
echo "   4. Configura permisos: storage/ y bootstrap/cache/ → 775"
echo ""
