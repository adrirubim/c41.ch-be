#!/bin/bash
# Script para ver el error completo del log
echo "=== ÚLTIMOS ERRORES EN EL LOG ==="
echo ""
tail -n 100 storage/logs/laravel.log | grep -A 5 "production.ERROR" | head -30
