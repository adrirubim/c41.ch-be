<?php

/**
 * Script para verificar y arreglar problemas con vendor/
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /public_html/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/arreglar-vendor.php
 * 3. El script verificará y mostrará qué falta
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><head><meta charset='UTF-8'><title>Verificar Vendor</title>";
echo '<style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    .ok { color: #4ec9b0; }
    .error { color: #f48771; }
    pre { background: #252526; padding: 15px; border-radius: 5px; }
</style></head><body>';
echo '<h1>🔍 Verificación de Vendor</h1>';
echo '<pre>';

$basePath = __DIR__;

// Verificar archivos críticos de Laravel
$criticalFiles = [
    'vendor/autoload.php' => 'Autoloader principal',
    'vendor/laravel/framework/src/Illuminate/Bus/BusServiceProvider.php' => 'BusServiceProvider (ERROR PRINCIPAL)',
    'vendor/laravel/framework/src/Illuminate/View/ViewServiceProvider.php' => 'ViewServiceProvider',
    'vendor/laravel/framework/src/Illuminate/Foundation/Application.php' => 'Application',
    'vendor/composer/autoload_classmap.php' => 'Classmap de Composer',
    'vendor/composer/autoload_psr4.php' => 'PSR-4 Autoload',
];

echo "📦 Verificando archivos críticos de Laravel...\n";
echo str_repeat('-', 60)."\n";

$missing = [];
$found = [];

foreach ($criticalFiles as $file => $description) {
    $fullPath = $basePath.'/'.$file;
    if (file_exists($fullPath)) {
        echo "✅ $file ($description)\n";
        $found[] = $file;
    } else {
        echo "❌ $file ($description) - NO ENCONTRADO\n";
        $missing[] = $file;
    }
}

// Verificar estructura de vendor/laravel
echo "\n📁 Verificando estructura de vendor/laravel...\n";
echo str_repeat('-', 60)."\n";

$laravelDirs = [
    'vendor/laravel/framework/src/Illuminate/Bus',
    'vendor/laravel/framework/src/Illuminate/View',
    'vendor/laravel/framework/src/Illuminate/Foundation',
    'vendor/laravel/framework/src/Illuminate/Container',
];

foreach ($laravelDirs as $dir) {
    $fullPath = $basePath.'/'.$dir;
    if (is_dir($fullPath)) {
        $files = count(glob($fullPath.'/*.php'));
        echo "✅ $dir (existe, $files archivos PHP)\n";
    } else {
        echo "❌ $dir - NO EXISTE\n";
        $missing[] = $dir;
    }
}

// Verificar composer.json
echo "\n📄 Verificando composer.json...\n";
echo str_repeat('-', 60)."\n";

$composerJson = $basePath.'/composer.json';
if (file_exists($composerJson)) {
    echo "✅ composer.json existe\n";
    $composer = json_decode(file_get_contents($composerJson), true);
    if (isset($composer['require']['laravel/framework'])) {
        echo '   Laravel Framework: '.$composer['require']['laravel/framework']."\n";
    }
} else {
    echo "❌ composer.json NO EXISTE\n";
    $missing[] = 'composer.json';
}

// Resumen
echo "\n".str_repeat('=', 60)."\n";
echo "📊 RESUMEN\n";
echo str_repeat('=', 60)."\n";
echo '✅ Archivos encontrados: '.count($found)."\n";
echo '❌ Archivos faltantes: '.count($missing)."\n\n";

if (count($missing) > 0) {
    echo "🔴 PROBLEMA DETECTADO:\n";
    echo "   La carpeta vendor/ está incompleta o corrupta.\n\n";
    echo "💡 SOLUCIÓN:\n";
    echo "   1. Vía SSH (recomendado):\n";
    echo "      ssh adri1104a7@185.42.105.95\n";
    echo "      cd /usr/home/adrirubim.es/web/cp3/activitat_39\n";
    echo "      composer install --no-dev --optimize-autoloader\n\n";
    echo "   2. O desde tu máquina local:\n";
    echo "      - Descarga composer.json y composer.lock\n";
    echo "      - Ejecuta: composer install --no-dev --optimize-autoloader\n";
    echo "      - Sube la carpeta vendor/ completa al servidor\n\n";
    echo "   3. Después de regenerar vendor:\n";
    echo "      php artisan optimize:clear\n";
    echo "      php artisan config:cache\n";
} else {
    echo "✅ Vendor parece estar completo.\n";
    echo "   Si aún hay errores, prueba:\n";
    echo "   composer dump-autoload --optimize\n";
}

echo "\n⚠️ IMPORTANTE: Elimina este archivo (arreglar-vendor.php) después de usarlo.\n";

echo '</pre></body></html>';
