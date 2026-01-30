<?php

/**
 * Script temporal para ejecutar seeders desde el navegador
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /web/cp3/activitat_39/ en el servidor
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/ejecutar-seeders.php
 * 3. Los seeders se ejecutarán y crearán el usuario administrador
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Ejecutar Seeders</title>";
echo '<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}';
echo '.success{color:green;margin:10px 0;font-weight:bold;} .error{color:red;margin:10px 0;}';
echo '.warning{color:orange;margin:10px 0;} pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style></head><body>';

echo '<h1>🌱 Ejecutando Seeders</h1>';
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

    // Verificar si el usuario admin ya existe
    echo "🔍 Verificando si el usuario admin ya existe...\n";
    $adminExists = $app->make('db')
        ->table('users')
        ->where('email', 'admin@example.com')
        ->exists();

    if ($adminExists) {
        echo "⚠️  El usuario admin@example.com ya existe en la base de datos.\n";
        echo "💡 Si quieres recrearlo, elimínalo primero desde phpMyAdmin o ejecuta:\n";
        echo "   DELETE FROM users WHERE email = 'admin@example.com';\n\n";
        echo "¿Deseas continuar de todos modos? (Esto creará un error de duplicado)\n";
        echo "O puedes eliminar el usuario existente y ejecutar este script de nuevo.\n\n";
    } else {
        echo "✅ El usuario admin no existe, se creará.\n\n";
    }

    // Ejecutar seeders
    echo "🌱 Ejecutando seeders...\n";
    $exitCode = $app->make(Illuminate\Contracts\Console\Kernel::class)
        ->call('db:seed', ['--force' => true]);

    if ($exitCode === 0) {
        echo "✅ Seeders ejecutados correctamente!\n\n";

        // Verificar que el usuario se creó
        echo "🔍 Verificando usuarios creados...\n";
        $users = $app->make('db')
            ->table('users')
            ->select('id', 'name', 'email', 'is_admin')
            ->get();

        echo "Usuarios en la base de datos:\n";
        foreach ($users as $user) {
            $adminBadge = $user->is_admin ? ' [ADMIN]' : '';
            echo "  - ID: {$user->id}, Email: {$user->email}, Nombre: {$user->name}{$adminBadge}\n";
        }

        echo "\n✅ Usuario administrador creado:\n";
        echo "   Email: admin@example.com\n";
        echo "   Credentials: see database/seeders/DatabaseSeeder.php (change in production).\n\n";

    } else {
        echo "⚠️ Seeders completados con código de salida: $exitCode\n\n";
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
}

echo '</pre>';
echo "<p class='warning'><strong>⚠️ IMPORTANTE: Elimina este archivo (ejecutar-seeders.php) por seguridad después de usarlo.</strong></p>";
echo '</body></html>';
