<?php

/**
 * Script temporal de diagnóstico para Laravel
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /public_html/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/diagnostico.php
 * 3. Revisa los resultados
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><head><meta charset='UTF-8'><title>Diagnóstico Laravel</title>";
echo '<style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    .ok { color: #4ec9b0; }
    .error { color: #f48771; }
    .warning { color: #dcdcaa; }
    pre { background: #252526; padding: 15px; border-radius: 5px; }
</style></head><body>';
echo '<h1>🔍 Diagnóstico Laravel</h1>';
echo '<pre>';

$errors = [];
$warnings = [];
$success = [];

// 1. Verificar archivos esenciales
echo "📁 Verificando archivos esenciales...\n";
echo str_repeat('-', 50)."\n";

$files = [
    'vendor/autoload.php' => 'Autoloader de Composer',
    'bootstrap/app.php' => 'Bootstrap de Laravel',
    '.env' => 'Archivo de configuración',
    'index.php' => 'Punto de entrada',
    '.htaccess' => 'Configuración Apache',
];

foreach ($files as $file => $description) {
    $exists = file_exists(__DIR__.'/'.$file);
    if ($exists) {
        echo "✅ $file ($description)\n";
        $success[] = $file;
    } else {
        echo "❌ $file ($description) - NO ENCONTRADO\n";
        $errors[] = $file;
    }
}

// 2. Verificar permisos
echo "\n🔐 Verificando permisos...\n";
echo str_repeat('-', 50)."\n";

$directories = [
    'storage' => 'Almacenamiento y logs',
    'storage/logs' => 'Logs de Laravel',
    'storage/framework' => 'Framework cache',
    'storage/framework/cache' => 'Cache de aplicación',
    'storage/framework/sessions' => 'Sesiones',
    'storage/framework/views' => 'Vistas compiladas',
    'bootstrap/cache' => 'Cache de bootstrap',
];

foreach ($directories as $dir => $description) {
    $path = __DIR__.'/'.$dir;
    $exists = is_dir($path);
    $writable = is_writable($path);
    $perms = $exists ? substr(sprintf('%o', fileperms($path)), -4) : 'N/A';

    if ($exists && $writable) {
        echo "✅ $dir ($description) - Permisos: $perms\n";
        $success[] = $dir;
    } elseif ($exists && ! $writable) {
        echo "⚠️  $dir ($description) - NO ESCRIBIBLE - Permisos: $perms\n";
        $warnings[] = "$dir (no escribible)";
    } else {
        echo "❌ $dir ($description) - NO EXISTE\n";
        $errors[] = $dir;
    }
}

// 3. Verificar .env
echo "\n⚙️  Verificando configuración .env...\n";
echo str_repeat('-', 50)."\n";

$envPath = __DIR__.'/.env';
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);

    $requiredVars = [
        'APP_KEY',
        'APP_ENV',
        'APP_DEBUG',
        'APP_URL',
        'DB_CONNECTION',
        'DB_HOST',
        'DB_DATABASE',
        'DB_USERNAME',
    ];

    foreach ($requiredVars as $var) {
        if (preg_match("/^$var=(.+)$/m", $envContent, $matches)) {
            $value = trim($matches[1]);
            if ($var === 'APP_KEY' && (empty($value) || $value === '')) {
                echo "❌ $var - NO CONFIGURADO (vacío)\n";
                $errors[] = "$var vacío";
            } elseif ($var === 'APP_KEY') {
                echo "✅ $var - Configurado\n";
                $success[] = $var;
            } else {
                echo "✅ $var = $value\n";
                $success[] = $var;
            }
        } else {
            echo "❌ $var - NO ENCONTRADO en .env\n";
            $errors[] = $var;
        }
    }
} else {
    echo "❌ Archivo .env no encontrado\n";
    $errors[] = '.env';
}

// 4. Verificar PHP
echo "\n🐘 Información de PHP...\n";
echo str_repeat('-', 50)."\n";
echo 'Versión: '.phpversion()."\n";

$requiredExtensions = ['pdo', 'mbstring', 'xml', 'curl', 'zip', 'openssl', 'json'];
echo "\nExtensiones requeridas:\n";
foreach ($requiredExtensions as $ext) {
    $loaded = extension_loaded($ext);
    if ($loaded) {
        echo "✅ $ext\n";
        $success[] = "ext_$ext";
    } else {
        echo "❌ $ext - NO INSTALADA\n";
        $errors[] = "ext_$ext";
    }
}

// 5. Intentar cargar Laravel
echo "\n🚀 Intentando cargar Laravel...\n";
echo str_repeat('-', 50)."\n";

try {
    $vendorPath = __DIR__.'/vendor/autoload.php';
    if (file_exists($vendorPath)) {
        require $vendorPath;
        echo "✅ Autoloader cargado\n";

        $bootstrapPath = __DIR__.'/bootstrap/app.php';
        if (file_exists($bootstrapPath)) {
            echo "✅ Bootstrap encontrado\n";
            // No intentamos cargar la app completa para evitar errores
            echo "⚠️  No se carga la aplicación completa (puede causar errores)\n";
        }
    } else {
        echo "❌ No se puede cargar Laravel - vendor/autoload.php no existe\n";
        $errors[] = 'Laravel no cargable';
    }
} catch (Exception $e) {
    echo '❌ Error al cargar Laravel: '.$e->getMessage()."\n";
    $errors[] = 'Error cargando Laravel';
}

// Resumen
echo "\n".str_repeat('=', 50)."\n";
echo "📊 RESUMEN\n";
echo str_repeat('=', 50)."\n";
echo '✅ Correctos: '.count($success)."\n";
echo '⚠️  Advertencias: '.count($warnings)."\n";
echo '❌ Errores: '.count($errors)."\n\n";

if (count($errors) > 0) {
    echo "🔴 PROBLEMAS ENCONTRADOS:\n";
    foreach ($errors as $error) {
        echo "   - $error\n";
    }
    echo "\n💡 SOLUCIONES:\n";
    echo "   1. Revisa los errores arriba\n";
    echo "   2. Consulta DIAGNOSTICO_ERROR_500.md\n";
    echo "   3. Verifica permisos: chmod -R 775 storage bootstrap/cache\n";
    echo "   4. Genera APP_KEY si falta: usar generar-app-key.php\n";
} else {
    echo "✅ No se encontraron errores críticos\n";
    if (count($warnings) > 0) {
        echo "\n⚠️  ADVERTENCIAS:\n";
        foreach ($warnings as $warning) {
            echo "   - $warning\n";
        }
    }
}

echo "\n⚠️  IMPORTANTE: Elimina este archivo (diagnostico.php) después de usarlo por seguridad.\n";

echo '</pre></body></html>';
