<?php

/**
 * Script para verificar usuarios en la base de datos
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /web/cp3/activitat_39/
 * 2. Visita: https://adrirubim.es/cp3/activitat_39/verificar-usuarios.php
 * 3. Verás todos los usuarios y sus credenciales
 * 4. ELIMINA este archivo después de usarlo por seguridad
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Verificar Usuarios</title>";
echo '<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}';
echo '.success{color:green;margin:10px 0;font-weight:bold;} .error{color:red;margin:10px 0;}';
echo '.warning{color:orange;margin:10px 0;} table{border-collapse:collapse;width:100%;margin:20px 0;}';
echo 'th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head><body>';

echo '<h1>👥 Verificando Usuarios</h1>';

try {
    require __DIR__.'/vendor/autoload.php';
    $app = require_once __DIR__.'/bootstrap/app.php';

    echo "<div class='success'>✅ Laravel cargado correctamente</div><br>";

    // Obtener todos los usuarios usando el modelo User
    $users = \App\Models\User::select('id', 'name', 'email', 'is_admin', 'email_verified_at', 'created_at')
        ->get();

    if ($users->count() === 0) {
        echo "<div class='error'>❌ No hay usuarios en la base de datos</div>";
        echo "<div class='warning'>💡 Ejecuta los seeders para crear usuarios.</div>";
    } else {
        echo "<div class='success'>✅ Se encontraron {$users->count()} usuario(s)</div><br>";

        echo '<table>';
        echo '<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Admin</th><th>Email Verificado</th><th>Creado</th></tr>';

        $adminFound = false;
        foreach ($users as $user) {
            $isAdmin = $user->is_admin ? '✅ Sí' : '❌ No';
            $emailVerified = $user->email_verified_at ? '✅ Sí' : '❌ No';

            if ($user->email === 'admin@example.com') {
                $adminFound = true;
                echo "<tr style='background-color:#d4edda;'>";
            } else {
                echo '<tr>';
            }

            echo "<td>{$user->id}</td>";
            echo "<td>{$user->name}</td>";
            echo "<td><strong>{$user->email}</strong></td>";
            echo "<td>{$isAdmin}</td>";
            echo "<td>{$emailVerified}</td>";
            echo "<td>{$user->created_at}</td>";
            echo '</tr>';
        }
        echo '</table>';

        echo '<br>';

        if ($adminFound) {
            echo "<div class='success'>";
            echo '<strong>✅ Usuario administrador encontrado:</strong><br>';
            echo 'Email: <strong>admin@example.com</strong><br>';
            echo 'Credentials: see <code>database/seeders/DatabaseSeeder.php</code> (change in production).';
            echo '</div>';
        } else {
            echo "<div class='error'>";
            echo '<strong>❌ Usuario administrador NO encontrado</strong><br>';
            echo "El email 'admin@example.com' no existe en la base de datos.<br>";
            echo '💡 Ejecuta los seeders para crearlo.';
            echo '</div>';
        }
    }

} catch (Throwable $e) {
    echo "<div class='error'>❌ ERROR:</div>";
    echo '<pre>';
    echo 'Mensaje: '.$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile()."\n";
    echo 'Línea: '.$e->getLine()."\n";
    echo '</pre>';
}

echo "<br><div class='warning'><strong>⚠️ IMPORTANTE: Elimina este archivo (verificar-usuarios.php) por seguridad después de usarlo.</strong></div>";
echo '</body></html>';
