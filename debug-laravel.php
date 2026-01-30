<?php

/**
 * Script para capturar el error exacto de Laravel
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /public_html/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/debug-laravel.php
 * 3. Verás el error exacto que causa el 500
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<html><head><meta charset='UTF-8'><title>Debug Laravel</title>";
echo '<style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    .error { color: #f48771; background: #3e1e1e; padding: 10px; border-left: 3px solid #f48771; margin: 10px 0; }
    .success { color: #4ec9b0; background: #1e3e1e; padding: 10px; border-left: 3px solid #4ec9b0; margin: 10px 0; }
    pre { background: #252526; padding: 15px; border-radius: 5px; overflow-x: auto; }
</style></head><body>';
echo '<h1>🐛 Debug Laravel - Capturando Error</h1>';

try {
    echo "<div class='success'>✅ Iniciando carga de Laravel...</div>";

    // Verificar archivos
    $vendorPath = __DIR__.'/vendor/autoload.php';
    $bootstrapPath = __DIR__.'/bootstrap/app.php';

    if (! file_exists($vendorPath)) {
        throw new Exception('vendor/autoload.php no encontrado');
    }

    if (! file_exists($bootstrapPath)) {
        throw new Exception('bootstrap/app.php no encontrado');
    }

    echo "<div class='success'>✅ Archivos encontrados</div>";

    // Cargar autoloader
    echo "<div class='success'>📦 Cargando autoloader...</div>";
    require $vendorPath;
    echo "<div class='success'>✅ Autoloader cargado</div>";

    // Cargar bootstrap
    echo "<div class='success'>🚀 Cargando bootstrap...</div>";
    $app = require_once $bootstrapPath;
    echo "<div class='success'>✅ Bootstrap cargado</div>";

    // Verificar configuración
    echo "<div class='success'>⚙️ Verificando configuración...</div>";
    $config = $app->make('config');
    echo '<pre>';
    echo 'APP_ENV: '.$config->get('app.env')."\n";
    echo 'APP_DEBUG: '.($config->get('app.debug') ? 'true' : 'false')."\n";
    echo 'APP_URL: '.$config->get('app.url')."\n";
    echo '</pre>';

    // Verificar base de datos
    echo "<div class='success'>🗄️ Verificando conexión a base de datos...</div>";
    try {
        $db = $app->make('db');
        $connection = $db->connection();
        $pdo = $connection->getPdo();
        echo "<div class='success'>✅ Conexión a base de datos exitosa</div>";
        echo '<pre>';
        echo 'Driver: '.$connection->getDriverName()."\n";
        echo 'Database: '.$connection->getDatabaseName()."\n";
        echo '</pre>';
    } catch (Exception $e) {
        echo "<div class='error'>❌ Error de base de datos: ".htmlspecialchars($e->getMessage()).'</div>';
        echo '<pre>'.htmlspecialchars($e->getTraceAsString()).'</pre>';
    }

    // Verificar Service Providers
    echo "<div class='success'>🔧 Verificando Service Providers...</div>";
    try {
        $providers = $app->getLoadedProviders();
        echo "<div class='success'>✅ Service Providers cargados: ".count($providers).'</div>';

        // Verificar AppServiceProvider
        if (isset($providers['App\Providers\AppServiceProvider'])) {
            echo "<div class='success'>✅ AppServiceProvider cargado</div>";
        }

        // Verificar FortifyServiceProvider
        if (isset($providers['App\Providers\FortifyServiceProvider'])) {
            echo "<div class='success'>✅ FortifyServiceProvider cargado</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>❌ Error en Service Providers: ".htmlspecialchars($e->getMessage()).'</div>';
    }

    // Verificar Middleware
    echo "<div class='success'>🛡️ Verificando Middleware...</div>";
    try {
        $middleware = $app->make('router')->getMiddleware();
        echo "<div class='success'>✅ Middleware registrados: ".count($middleware).'</div>';
    } catch (Exception $e) {
        echo "<div class='error'>❌ Error verificando middleware: ".htmlspecialchars($e->getMessage()).'</div>';
    }

    // Verificar rutas
    echo "<div class='success'>🛣️ Verificando rutas...</div>";
    try {
        $routes = $app->make('router')->getRoutes();
        echo "<div class='success'>✅ Rutas registradas: ".count($routes).'</div>';
    } catch (Exception $e) {
        echo "<div class='error'>❌ Error verificando rutas: ".htmlspecialchars($e->getMessage()).'</div>';
    }

    // Intentar capturar una request
    echo "<div class='success'>🌐 Intentando procesar request...</div>";
    try {
        $request = Illuminate\Http\Request::capture();
        echo "<div class='success'>✅ Request capturado</div>";
        echo '<pre>';
        echo 'Method: '.$request->method()."\n";
        echo 'URI: '.$request->getRequestUri()."\n";
        echo '</pre>';

        // Intentar manejar el request
        echo "<div class='success'>🔄 Intentando manejar request...</div>";
        $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
        $response = $kernel->handle($request);
        echo "<div class='success'>✅ Request manejado exitosamente</div>";
        echo '<pre>';
        echo 'Status: '.$response->getStatusCode()."\n";
        echo '</pre>';

        // No enviamos la respuesta real para no interferir
        $kernel->terminate($request, $response);

    } catch (Exception $e) {
        echo "<div class='error'>❌ Error al procesar request:</div>";
        echo "<div class='error'>";
        echo '<strong>Mensaje:</strong> '.htmlspecialchars($e->getMessage()).'<br>';
        echo '<strong>Archivo:</strong> '.htmlspecialchars($e->getFile()).'<br>';
        echo '<strong>Línea:</strong> '.$e->getLine().'<br>';
        echo '</div>';
        echo '<pre>'.htmlspecialchars($e->getTraceAsString()).'</pre>';

        // Información adicional sobre el error
        if (strpos($e->getMessage(), 'database') !== false || strpos($e->getMessage(), 'SQL') !== false) {
            echo "<div class='error'><strong>💡 SUGERENCIA:</strong> El error parece estar relacionado con la base de datos. Verifica:</div>";
            echo '<ul>';
            echo '<li>Las credenciales en .env</li>';
            echo '<li>Que la base de datos exista</li>';
            echo '<li>Que las migraciones estén ejecutadas</li>';
            echo '</ul>';
        }

        if (strpos($e->getMessage(), 'Class') !== false && strpos($e->getMessage(), 'not found') !== false) {
            echo "<div class='error'><strong>💡 SUGERENCIA:</strong> Falta una clase. Ejecuta:</div>";
            echo '<pre>composer dump-autoload</pre>';
        }
    }

    echo "<div class='success'>✅ Laravel se cargó correctamente</div>";
    echo '<p><strong>Si ves este mensaje, Laravel funciona. El error 500 puede ser por:</strong></p>';
    echo '<ul>';
    echo '<li>Problema con una ruta específica</li>';
    echo '<li>Problema con middleware</li>';
    echo '<li>Problema con una vista</li>';
    echo '<li>Revisa storage/logs/laravel.log para más detalles</li>';
    echo '</ul>';

} catch (Throwable $e) {
    echo "<div class='error'>❌ ERROR CAPTURADO:</div>";
    echo "<div class='error'>";
    echo '<strong>Tipo:</strong> '.get_class($e).'<br>';
    echo '<strong>Mensaje:</strong> '.htmlspecialchars($e->getMessage()).'<br>';
    echo '<strong>Archivo:</strong> '.htmlspecialchars($e->getFile()).'<br>';
    echo '<strong>Línea:</strong> '.$e->getLine().'<br>';
    echo '</div>';
    echo '<h2>Stack Trace:</h2>';
    echo '<pre>'.htmlspecialchars($e->getTraceAsString()).'</pre>';

    // Información adicional
    echo '<h2>Información del Sistema:</h2>';
    echo '<pre>';
    echo 'PHP Version: '.phpversion()."\n";
    echo 'Memory Limit: '.ini_get('memory_limit')."\n";
    echo 'Max Execution Time: '.ini_get('max_execution_time')."\n";
    echo 'Error Reporting: '.error_reporting()."\n";
    echo '</pre>';
}

echo '<hr>';
echo '<p><strong>⚠️ IMPORTANTE:</strong> Elimina este archivo (debug-laravel.php) después de usarlo por seguridad.</p>';
echo '</body></html>';
