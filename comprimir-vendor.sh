#!/bin/bash
cd /var/www/c41.ch-be

echo "Verificando que vendor existe..."
if [ ! -d "vendor" ]; then
    echo "ERROR: El directorio vendor no existe"
    exit 1
fi

echo "Comprimiendo vendor..."
tar -czf vendor.tar.gz vendor/

if [ -f "vendor.tar.gz" ]; then
    SIZE=$(du -h vendor.tar.gz | cut -f1)
    echo "✅ vendor.tar.gz creado correctamente"
    echo "Tamaño: $SIZE"
    echo ""
    echo "Archivo listo para subir: $(pwd)/vendor.tar.gz"
else
    echo "ERROR: No se pudo crear vendor.tar.gz"
    exit 1
fi
