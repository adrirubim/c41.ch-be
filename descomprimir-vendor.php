<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Descomprimir Vendor</title>";
echo '<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}';
echo '.success{color:green;margin:10px 0;} .error{color:red;margin:10px 0;} .warning{color:orange;margin:10px 0;}';
echo 'pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style></head><body>';

echo '<h1>📦 Descomprimiendo Vendor</h1>';

$zipFile = __DIR__.'/vendor.zip';
$tarFile = __DIR__.'/vendor.tar.gz';
$targetDir = __DIR__.'/vendor';

// Función para eliminar directorio recursivamente
function deleteDirectory($dir)
{
    if (! file_exists($dir)) {
        return true;
    }
    if (! is_dir($dir)) {
        return unlink($dir);
    }
    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        if (! deleteDirectory($dir.DIRECTORY_SEPARATOR.$item)) {
            return false;
        }
    }

    return rmdir($dir);
}

// Eliminar vendor actual si existe
if (is_dir($targetDir)) {
    echo "<div class='warning'>🗑️ Eliminando vendor actual...</div>";
    if (deleteDirectory($targetDir)) {
        echo "<div class='success'>✅ Vendor anterior eliminado</div>";
    } else {
        echo "<div class='error'>❌ Error al eliminar vendor anterior. Puede que algunos archivos estén bloqueados.</div>";
    }
}

// Descomprimir ZIP
if (file_exists($zipFile)) {
    echo "<div class='success'>📦 Encontrado vendor.zip, descomprimiendo...</div>";

    if (! class_exists('ZipArchive')) {
        echo "<div class='error'>❌ La extensión ZipArchive no está disponible en PHP</div>";
    } else {
        $zip = new ZipArchive;
        if ($zip->open($zipFile) === true) {
            echo '<div>Extrayendo '.$zip->numFiles.' archivos...</div>';
            $zip->extractTo(__DIR__);
            $zip->close();
            echo "<div class='success'>✅ vendor.zip descomprimido correctamente</div>";

            // Eliminar el archivo comprimido
            if (unlink($zipFile)) {
                echo "<div class='success'>✅ Archivo vendor.zip eliminado</div>";
            }
        } else {
            echo "<div class='error'>❌ Error al abrir vendor.zip. Código: ".$zip->open($zipFile).'</div>';
        }
    }
}
// Descomprimir TAR.GZ
elseif (file_exists($tarFile)) {
    echo "<div class='success'>📦 Encontrado vendor.tar.gz, descomprimiendo...</div>";

    if (! class_exists('PharData')) {
        echo "<div class='error'>❌ La clase PharData no está disponible en PHP</div>";
        echo "<div class='warning'>💡 Intenta usar vendor.zip en su lugar (soporta ZipArchive)</div>";
    } else {
        try {
            $phar = new PharData($tarFile);
            echo '<div>Extrayendo archivos...</div>';
            $phar->extractTo(__DIR__);
            echo "<div class='success'>✅ vendor.tar.gz descomprimido correctamente</div>";

            // Eliminar el archivo comprimido
            if (unlink($tarFile)) {
                echo "<div class='success'>✅ Archivo vendor.tar.gz eliminado</div>";
            }
        } catch (Exception $e) {
            echo "<div class='error'>❌ Error al descomprimir: ".$e->getMessage().'</div>';
        }
    }
} else {
    echo "<div class='error'>❌ No se encontró vendor.zip ni vendor.tar.gz en el directorio actual</div>";
    echo "<div class='warning'>💡 Asegúrate de haber subido el archivo comprimido a: ".__DIR__.'</div>';
}

// Verificar que BusServiceProvider existe
$busProvider = $targetDir.'/laravel/framework/src/Illuminate/Bus/BusServiceProvider.php';
if (file_exists($busProvider)) {
    echo "<div class='success'>✅ Vendor regenerado correctamente</div>";
    echo "<div class='success'>✅ BusServiceProvider encontrado en: ".$busProvider.'</div>';
    echo "<div class='success'><strong>🎉 ¡Vendor instalado correctamente!</strong></div>";
    echo "<div class='warning'><strong>⚠️ IMPORTANTE: Elimina este archivo (descomprimir-vendor.php) después de verificar que todo funciona.</strong></div>";
} else {
    echo "<div class='error'>⚠️ Vendor descomprimido pero BusServiceProvider no encontrado</div>";
    echo "<div class='warning'>Verifica que la estructura de vendor es correcta</div>";

    // Mostrar estructura de vendor si existe
    if (is_dir($targetDir)) {
        echo '<div><strong>Estructura de vendor:</strong></div>';
        echo '<pre>';
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($targetDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        $count = 0;
        foreach ($iterator as $file) {
            if ($count++ > 20) {
                echo "... (mostrando primeros 20 archivos)\n";
                break;
            }
            echo str_replace(__DIR__.'/', '', $file->getPathname())."\n";
        }
        echo '</pre>';
    }
}

echo '</body></html>';
