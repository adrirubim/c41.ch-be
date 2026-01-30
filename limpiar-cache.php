<?php

/**
 * Script temporal para limpiar caché de Laravel desde el navegador
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /web/cp3/activitat_39/ en el servidor
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/limpiar-cache.php
 * 3. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Limpiar Caché</title>";
echo '<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}';
echo '.success{color:green;margin:10px 0;font-weight:bold;} .error{color:red;margin:10px 0;}';
echo 'pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style></head><body>';

echo '<h1>🧹 Limpiando Caché de Laravel</h1>';

try {
    // Verificar que los archivos necesarios existan
    $vendorPath = __DIR__.'/vendor/autoload.php';
    $bootstrapPath = __DIR__.'/bootstrap/app.php';

    if (! file_exists($vendorPath)) {
        throw new Exception('No se encuentra vendor/autoload.php');
    }

    if (! file_exists($bootstrapPath)) {
        throw new Exception('No se encuentra bootstrap/app.php');
    }

    echo "<div class='success'>✅ Archivos encontrados</div>";

    // Cargar Laravel
    require $vendorPath;
    $app = require_once $bootstrapPath;

    echo "<div class='success'>✅ Laravel cargado</div><br>";

    // Limpiar cachés
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    echo '<div>🔄 Limpiando caché de configuración...</div>';
    $kernel->call('config:clear');
    echo "<div class='success'>✅ Config cache limpiado</div>";

    echo '<div>🔄 Limpiando caché de rutas...</div>';
    $kernel->call('route:clear');
    echo "<div class='success'>✅ Route cache limpiado</div>";

    echo '<div>🔄 Limpiando caché de vistas...</div>';
    $kernel->call('view:clear');
    echo "<div class='success'>✅ View cache limpiado</div>";

    echo '<div>🔄 Limpiando caché general...</div>';
    $kernel->call('cache:clear');
    echo "<div class='success'>✅ Cache general limpiado</div>";

    echo "<br><div class='success'><strong>🎉 ¡Caché limpiado correctamente!</strong></div>";
    echo "<div class='error'><strong>⚠️ IMPORTANTE: Elimina este archivo (limpiar-cache.php) del servidor por seguridad.</strong></div>";

    // Mostrar información útil
    echo '<br><div><strong>Información actual:</strong></div>';
    echo '<pre>';
    echo 'APP_URL: '.config('app.url')."\n";
    echo 'APP_ENV: '.config('app.env')."\n";
    echo 'APP_DEBUG: '.(config('app.debug') ? 'true' : 'false')."\n";
    echo '</pre>';

} catch (Throwable $e) {
    echo "<div class='error'>❌ ERROR:</div>";
    echo '<pre>';
    echo 'Mensaje: '.$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile()."\n";
    echo 'Línea: '.$e->getLine()."\n";
    echo '</pre>';
}

echo '</body></html>';
