<?php

/**
 * Script temporal para ejecutar migraciones desde el navegador
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /web/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/run-migrations.php
 * 3. Las migraciones se ejecutarán
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */

// Habilitar mostrar errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<html><head><meta charset='UTF-8'><title>Ejecutar Migraciones</title></head><body>";
echo '<h1>Ejecutando Migraciones</h1>';
echo '<pre>';

try {
    // Verificar que los archivos necesarios existan
    $vendorPath = __DIR__.'/vendor/autoload.php';
    $bootstrapPath = __DIR__.'/bootstrap/app.php';

    if (! file_exists($vendorPath)) {
        throw new Exception('No se encuentra vendor/autoload.php en: '.$vendorPath);
    }

    if (! file_exists($bootstrapPath)) {
        throw new Exception('No se encuentra bootstrap/app.php en: '.$bootstrapPath);
    }

    echo "✅ Archivos encontrados\n";
    echo '   - Vendor: '.$vendorPath."\n";
    echo '   - Bootstrap: '.$bootstrapPath."\n\n";

    // Cargar Laravel
    echo "📦 Cargando Laravel...\n";
    require $vendorPath;

    echo "🚀 Inicializando aplicación...\n";
    $app = require_once $bootstrapPath;

    echo "✅ Laravel cargado correctamente\n\n";

    // Ejecutar migraciones
    echo "🔄 Ejecutando migraciones...\n";
    $exitCode = $app->make(Illuminate\Contracts\Console\Kernel::class)
        ->call('migrate', ['--force' => true]);

    if ($exitCode === 0) {
        echo "✅ Migraciones ejecutadas correctamente!\n\n";
    } else {
        echo "⚠️ Migraciones completadas con código de salida: $exitCode\n\n";
    }

    // Ejecutar seeders
    echo "🌱 Ejecutando seeders...\n";
    try {
        $seedExitCode = $app->make(Illuminate\Contracts\Console\Kernel::class)
            ->call('db:seed', ['--force' => true]);

        if ($seedExitCode === 0) {
            echo "✅ Seeders ejecutados correctamente!\n\n";

            // Verificar usuarios creados
            echo "🔍 Verificando usuarios creados...\n";
            $users = $app->make('db')
                ->table('users')
                ->select('id', 'name', 'email', 'is_admin')
                ->get();

            if ($users->count() > 0) {
                echo "Usuarios en la base de datos:\n";
                foreach ($users as $user) {
                    $adminBadge = $user->is_admin ? ' [ADMIN]' : '';
                    echo "  - ID: {$user->id}, Email: {$user->email}, Nombre: {$user->name}{$adminBadge}\n";
                }
                echo "\n✅ Usuario administrador disponible:\n";
                echo "   Email: admin@example.com\n";
                echo "   Credentials: see database/seeders/DatabaseSeeder.php (change in production).\n\n";
            } else {
                echo "⚠️ No se encontraron usuarios. Verifica el seeder.\n\n";
            }
        } else {
            echo "⚠️ Seeders completados con código de salida: $seedExitCode\n\n";
        }
    } catch (Exception $e) {
        echo '⚠️ Error al ejecutar seeders: '.$e->getMessage()."\n\n";
    }

    // Crear enlace de storage
    echo "🔗 Creando enlace de storage...\n";
    try {
        $app->make(Illuminate\Contracts\Console\Kernel::class)->call('storage:link');
        echo "✅ Enlace de storage creado!\n\n";
    } catch (Exception $e) {
        echo '⚠️ No se pudo crear el enlace (puede que ya exista): '.$e->getMessage()."\n\n";
    }

    // Optimizar
    echo "⚡ Optimizando Laravel...\n";
    try {
        $app->make(Illuminate\Contracts\Console\Kernel::class)->call('config:cache');
        echo "✅ Config cacheado\n";

        $app->make(Illuminate\Contracts\Console\Kernel::class)->call('route:cache');
        echo "✅ Rutas cacheadas\n";

        $app->make(Illuminate\Contracts\Console\Kernel::class)->call('view:cache');
        echo "✅ Vistas cacheadas\n\n";
    } catch (Exception $e) {
        echo '⚠️ Error al optimizar: '.$e->getMessage()."\n\n";
    }

    echo "🎉 ¡Proceso completado!\n";

} catch (Throwable $e) {
    echo "\n❌ ERROR:\n";
    echo 'Mensaje: '.$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile()."\n";
    echo 'Línea: '.$e->getLine()."\n";
    echo "\nStack Trace:\n".$e->getTraceAsString();

    // Información adicional de debugging
    echo "\n\n📋 Información del Sistema:\n";
    echo 'PHP Version: '.phpversion()."\n";
    echo 'Directorio actual: '.__DIR__."\n";
    echo 'Archivos en directorio: '.implode(', ', array_slice(scandir(__DIR__), 0, 10))."\n";
}

echo '</pre>';
echo '<p><strong>⚠️ IMPORTANTE: Elimina este archivo (run-migrations.php) por seguridad después de usarlo.</strong></p>';
echo '</body></html>';
