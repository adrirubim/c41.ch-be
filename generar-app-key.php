<?php

/**
 * Script temporal para generar APP_KEY en producción
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /public_html/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/generar-app-key.php
 * 3. El APP_KEY se generará y se actualizará en .env
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><head><meta charset='UTF-8'><title>Generar APP_KEY</title></head><body>";
echo '<h1>Generar APP_KEY</h1>';
echo '<pre>';

try {
    $envPath = __DIR__.'/.env';

    if (! file_exists($envPath)) {
        throw new Exception('No se encuentra el archivo .env en: '.$envPath);
    }

    echo "✅ Archivo .env encontrado\n\n";

    // Leer .env
    $envContent = file_get_contents($envPath);

    // Generar nueva clave
    echo "🔑 Generando nueva APP_KEY...\n";
    $key = 'base64:'.base64_encode(random_bytes(32));

    // Actualizar o agregar APP_KEY
    if (preg_match('/^APP_KEY=.*/m', $envContent)) {
        $envContent = preg_replace('/^APP_KEY=.*/m', 'APP_KEY='.$key, $envContent);
        echo "✅ APP_KEY actualizado\n";
    } else {
        $envContent = 'APP_KEY='.$key."\n".$envContent;
        echo "✅ APP_KEY agregado\n";
    }

    // Guardar .env
    if (file_put_contents($envPath, $envContent)) {
        echo "✅ Archivo .env actualizado correctamente\n\n";
        echo 'Nueva APP_KEY: '.$key."\n\n";
        echo "✅ ¡APP_KEY generado exitosamente!\n";
        echo "\n⚠️ IMPORTANTE: Elimina este archivo (generar-app-key.php) después de usarlo.\n";
    } else {
        throw new Exception('No se pudo escribir en el archivo .env. Verifica permisos.');
    }

} catch (Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
    echo "\nSolución alternativa:\n";
    echo "1. Descarga el archivo .env vía FTP\n";
    echo '2. Agrega o modifica la línea: APP_KEY=base64:'.base64_encode(random_bytes(32))."\n";
    echo "3. Vuelve a subir el archivo .env\n";
}

echo '</pre></body></html>';
