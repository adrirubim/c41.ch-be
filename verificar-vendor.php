<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Verificar Vendor</title>";
echo '<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}';
echo '.success{color:green;margin:10px 0;font-weight:bold;} .error{color:red;margin:10px 0;font-weight:bold;}';
echo '.info{color:blue;margin:10px 0;} pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style></head><body>';

echo '<h1>🔍 Verificación de Vendor</h1>';

$vendorDir = __DIR__.'/vendor';
$busProvider = $vendorDir.'/laravel/framework/src/Illuminate/Bus/BusServiceProvider.php';
$autoload = $vendorDir.'/autoload.php';

echo "<div class='info'>📁 Directorio actual: ".__DIR__.'</div>';
echo "<div class='info'>📦 Ruta vendor: ".$vendorDir.'</div><br>';

// Verificar si vendor existe
if (is_dir($vendorDir)) {
    echo "<div class='success'>✅ El directorio vendor/ EXISTE</div>";

    // Verificar BusServiceProvider
    if (file_exists($busProvider)) {
        echo "<div class='success'>✅ BusServiceProvider encontrado</div>";
    } else {
        echo "<div class='error'>❌ BusServiceProvider NO encontrado en: ".$busProvider.'</div>';
    }

    // Verificar autoload
    if (file_exists($autoload)) {
        echo "<div class='success'>✅ vendor/autoload.php encontrado</div>";
    } else {
        echo "<div class='error'>❌ vendor/autoload.php NO encontrado</div>";
    }

    // Contar archivos en vendor
    $fileCount = count(glob($vendorDir.'/*'));
    echo "<div class='info'>📊 Archivos/carpetas en vendor/: $fileCount</div>";

    // Listar algunas carpetas principales
    echo "<div class='info'><strong>Estructura de vendor/:</strong></div>";
    echo '<pre>';
    $items = scandir($vendorDir);
    $count = 0;
    foreach ($items as $item) {
        if ($item != '.' && $item != '..') {
            $path = $vendorDir.'/'.$item;
            $type = is_dir($path) ? '[DIR]' : '[FILE]';
            $size = is_file($path) ? ' ('.number_format(filesize($path)).' bytes)' : '';
            echo "$type $item$size\n";
            $count++;
            if ($count > 20) {
                echo "... (mostrando primeros 20)\n";
                break;
            }
        }
    }
    echo '</pre>';

} else {
    echo "<div class='error'>❌ El directorio vendor/ NO EXISTE</div>";
    echo "<div class='error'>⚠️ Esto explica los errores. Necesitas descomprimir vendor.tar.gz</div>";

    // Verificar si existe vendor.tar.gz
    $tarFile = __DIR__.'/vendor.tar.gz';
    if (file_exists($tarFile)) {
        $size = filesize($tarFile);
        echo "<div class='info'>📦 vendor.tar.gz encontrado (".number_format($size).' bytes)</div>';
        echo "<div class='info'>💡 Ejecuta descomprimir-vendor.php para extraerlo</div>";
    } else {
        echo "<div class='error'>❌ vendor.tar.gz tampoco existe</div>";
    }
}

echo '</body></html>';
