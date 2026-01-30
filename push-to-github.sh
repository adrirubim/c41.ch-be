#!/bin/bash
# Subir a GitHub sin historial previo (un solo commit inicial)
# Ejecutar desde la raíz del proyecto: bash push-to-github.sh

set -e
REPO="https://github.com/adrirubim/c41.ch-be.git"

echo "→ Eliminando historial git anterior..."
rm -rf .git

echo "→ Inicializando repositorio nuevo..."
git init

echo "→ Añadiendo archivos (respetando .gitignore)..."
git add .

echo "→ Creando commit inicial..."
git commit -m "Initial commit - C41.ch Backend production ready"

echo "→ Configurando remote..."
git remote add origin "$REPO"

echo "→ Rama main..."
git branch -M main

echo "→ Subiendo a GitHub (force por repo recién recreado)..."
git push -u origin main --force

echo "✅ Listo. Repositorio en: $REPO"
