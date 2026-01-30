# 🚀 Guía de Despliegue en CDMON - Subcarpeta /cp3/activitat_39/

Esta guía está específicamente adaptada para desplegar Laravel en **CDMON** (hosting compartido) usando FileZilla.

> **Nota**: Esta guía también es aplicable a otros servicios de hosting compartido similares a CDMON.

## 📋 Consideraciones Especiales para CDMON

CDMON es un hosting compartido, por lo que:

- ✅ **SÍ puedes subir archivos** vía FTP/FileZilla
- ⚠️ **Puede que NO tengas acceso SSH** (depende del plan)
- ⚠️ **Necesitas verificar** que CDMON soporte:
  - PHP 8.2 o superior
  - Extensiones PHP necesarias (pgsql, mbstring, xml, curl, zip, gd, fileinfo)
  - PostgreSQL (o MySQL si prefieres cambiar)
  - `mod_rewrite` habilitado (para `.htaccess`)

## 🔍 Verificación Previa

Antes de empezar, verifica en el panel de control de CDMON:

1. **Versión de PHP**: Debe ser 8.2 o superior
2. **Extensiones PHP**: Verifica que estén habilitadas
3. **Base de datos**: Crea una base de datos PostgreSQL (o MySQL)
4. **Ruta del servidor**: Anota la ruta donde se alojan tus archivos (normalmente `/public_html/` o `/www/`)

---

## 🔧 Preparación Local

### 1. Compilar Assets

```bash
cd /var/www/c41.ch-be
npm run build
```

### 2. Instalar Dependencias PHP (Producción)

```bash
# Si tienes problemas, simplemente sube el vendor actual
composer install --optimize-autoloader --no-dev
```

**Nota**: Si `composer install --no-dev` falla, puedes subir el `vendor/` actual y luego, si tienes acceso SSH en CDMON, ejecutar el comando allí.

### 3. Configurar `.env` para Producción

Crea/edita el archivo `.env` con estos valores:

```env
APP_NAME="C41.ch Blog"
APP_ENV=production
APP_KEY=base64:... # Generar con: php artisan key:generate
APP_DEBUG=false
APP_URL=https://adrirubim.es/cp3/activitat_39

LOG_CHANNEL=stack
LOG_LEVEL=error

# Base de datos CDMON (PostgreSQL o MySQL)
DB_CONNECTION=pgsql
DB_HOST=localhost  # O la IP que te proporcione CDMON
DB_PORT=5432
DB_DATABASE=nombre_base_datos_cdmon
DB_USERNAME=usuario_db_cdmon
DB_PASSWORD=contraseña_db_cdmon

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

FILESYSTEM_DISK=local
```

**⚠️ IMPORTANTE**: 
- `APP_URL` debe ser: `https://adrirubim.es/cp3/activitat_39`
- Los datos de base de datos los obtienes del panel de control de CDMON

### 4. Optimizar la Aplicación

```bash
# Generar clave de aplicación
php artisan key:generate

# Cachear configuración
php artisan config:cache

# Cachear rutas
php artisan route:cache

# Cachear vistas
php artisan view:cache
```

---

## 📤 Despliegue con FileZilla en CDMON

### Paso 1: Conectar con FileZilla

1. Abre FileZilla
2. Configura la conexión:
   - **Host**: `ftp.adrirubim.es` (o la que te proporcione CDMON)
   - **Usuario**: Tu usuario FTP de CDMON
   - **Contraseña**: Tu contraseña FTP
   - **Puerto**: 21 (FTP) o 22 (SFTP si está disponible)
3. Conecta al servidor

### Paso 2: Navegar a la Carpeta de Destino

En el panel remoto (lado derecho), navega a:
- `/public_html/cp3/activitat_39/` (si CDMON usa `public_html`)
- O `/www/cp3/activitat_39/` (si CDMON usa `www`)
- O la ruta que te indique CDMON

**Si la carpeta `activitat_39` no existe, créala primero**.

### Paso 3: Subir Archivos

Sube **TODOS** estos archivos y carpetas:

#### ✅ Archivos y Carpetas a Subir:

```
app/                    ← ✅ SUBIR (completa)
bootstrap/              ← ✅ SUBIR (completa)
config/                 ← ✅ SUBIR (completa)
database/               ← ✅ SUBIR (completa)
public/                 ← ✅ SUBIR (completa, incluye build/)
resources/              ← ✅ SUBIR (completa)
routes/                 ← ✅ SUBIR (completa)
storage/                ← ✅ SUBIR (completa)
vendor/                 ← ✅ SUBIR (completa - dependencias PHP)
artisan                 ← ✅ SUBIR
composer.json           ← ✅ SUBIR
composer.lock           ← ✅ SUBIR
index.php               ← ✅ SUBIR (en la raíz - punto de entrada)
.htaccess               ← ✅ SUBIR (en la raíz - configuración Apache)
.env                    ← ✅ SUBIR (configurado para producción)
vite.config.ts          ← ✅ SUBIR
tsconfig.json           ← ✅ SUBIR (opcional)
package.json            ← ✅ SUBIR (opcional)
```

#### ❌ NO Subir:

```
node_modules/           ← ❌ NO subir (no necesario)
.git/                   ← ❌ NO subir
tests/                  ← ❌ NO subir
docs/                   ← ❌ NO subir (opcional)
workflows/              ← ❌ NO subir
.env.example            ← ❌ NO subir
```

### Paso 4: Estructura en CDMON

La estructura debería quedar así:

```
/public_html/cp3/activitat_39/    (o la ruta que use CDMON)
├── app/
├── bootstrap/
├── config/
├── database/
├── public/              ← Carpeta con assets estáticos
│   ├── build/           ← Assets compilados (CSS/JS)
│   ├── favicon.*
│   └── ...              ← Otros archivos estáticos
├── resources/
├── routes/
├── storage/
├── vendor/
├── artisan
├── composer.json
├── index.php            ← ✅ PUNTO DE ENTRADA (en la raíz)
├── .htaccess            ← ✅ Configuración Apache (en la raíz)
├── .env
└── ...
```

**IMPORTANTE**: 
- `index.php` está en la **raíz** del proyecto (no dentro de `public/`)
- `.htaccess` está en la **raíz** del proyecto
- Los assets compilados están en `public/build/`

### Paso 5: Configurar el DocumentRoot en CDMON

**IMPORTANTE**: En hosting compartido como CDMON, normalmente el servidor web apunta directamente a `public_html/`. Tienes dos opciones:

#### Configuración del Servidor

Con esta estructura, el `index.php` está en la raíz, por lo que:

1. **CDMON debe apuntar** a `/public_html/cp3/activitat_39/` (la raíz del proyecto)
2. El archivo `index.php` en la raíz será el punto de entrada
3. El `.htaccess` en la raíz manejará las rutas de Laravel

**No necesitas configurar DocumentRoot a `public/`** porque `index.php` ya está en la raíz.

Si CDMON tiene alguna configuración especial para subcarpetas, simplemente asegúrate de que apunte a `/public_html/cp3/activitat_39/`.

### Paso 6: Configurar Permisos

En CDMON, normalmente puedes configurar permisos desde el panel de control o FileZilla:

**Permisos necesarios**:
- `storage/`: **775** (lectura, escritura, ejecución)
- `bootstrap/cache/`: **775**
- Resto de archivos: **644**
- Resto de directorios: **755**

**Cómo hacerlo en FileZilla**:
1. Click derecho en la carpeta/archivo → "Permisos de archivo"
2. Configura los permisos según lo indicado arriba

### Paso 7: Crear Enlace Simbólico de Storage

**Si tienes acceso SSH en CDMON**:

```bash
cd /ruta/a/cp3/activitat_39
php artisan storage:link
```

**Si NO tienes acceso SSH**:

1. Desde el panel de control de CDMON, busca la opción de "Terminal" o "SSH"
2. O contacta al soporte de CDMON para que creen el enlace simbólico
3. O crea manualmente un enlace desde `public/storage` → `../storage/app/public` (si el panel lo permite)

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar que la Aplicación Carga

Visita: `https://adrirubim.es/cp3/activitat_39/`

**Si ves errores**:

- **Error 500**: 
  - Revisa los logs en `storage/logs/laravel.log` (accesible vía FTP)
  - Verifica que `APP_KEY` esté configurado en `.env`
  - Verifica permisos de `storage/` y `bootstrap/cache/`

- **Error 404**: 
  - Verifica que el `.htaccess` esté en `public/.htaccess`
  - Verifica que `mod_rewrite` esté habilitado en CDMON
  - Verifica la configuración del DocumentRoot

- **Assets no cargan**: 
  - Verifica que `APP_URL` en `.env` sea `https://adrirubim.es/cp3/activitat_39`
  - Verifica que la carpeta `public/build/` esté subida correctamente

### 2. Verificar Base de Datos

Intenta acceder a una ruta que requiera base de datos. Si hay errores de conexión:

1. Verifica las credenciales en `.env`
2. Verifica que la base de datos esté creada en CDMON
3. Verifica que el host sea correcto (puede ser `localhost` o una IP específica)

### 3. Ejecutar Migraciones

**Si tienes acceso SSH**:

```bash
cd /ruta/a/cp3/activitat_39
php artisan migrate --force
```

**Si NO tienes acceso SSH**:

1. Busca en el panel de CDMON si hay un "Terminal" o "SSH"
2. O contacta al soporte de CDMON para ejecutar las migraciones
3. O usa un script PHP temporal para ejecutar migraciones (menos recomendado)

---

## 🛠️ Solución de Problemas Específicos de CDMON

### Problema: PHP Version

**Síntoma**: Error de versión de PHP

**Solución**:
1. En el panel de CDMON, selecciona PHP 8.2 o superior
2. Puede que necesites crear un archivo `.htaccess` o `.user.ini` para forzar la versión

### Problema: Extensiones PHP Faltantes

**Síntoma**: Error "Class not found" o "Extension not loaded"

**Solución**:
1. En el panel de CDMON, habilita las extensiones necesarias
2. O crea un `php.ini` personalizado si CDMON lo permite

### Problema: mod_rewrite No Funciona

**Síntoma**: Rutas devuelven 404

**Solución**:
1. Verifica que `mod_rewrite` esté habilitado en CDMON
2. Contacta al soporte si no puedes habilitarlo tú mismo

### Problema: Permisos de Escritura

**Síntoma**: Error al escribir en `storage/`

**Solución**:
1. Configura permisos 775 en `storage/` y `bootstrap/cache/`
2. Verifica que el usuario del servidor web tenga permisos de escritura

---

## 📝 Checklist de Despliegue en CDMON

- [ ] Verificar que CDMON soporta PHP 8.2+
- [ ] Verificar extensiones PHP necesarias
- [ ] Crear base de datos en CDMON
- [ ] Assets compilados (`npm run build`)
- [ ] Dependencias PHP instaladas (`composer install --no-dev`)
- [ ] Archivo `.env` configurado con datos de CDMON
- [ ] `APP_URL` configurado: `https://adrirubim.es/cp3/activitat_39`
- [ ] `APP_KEY` generado
- [ ] Configuración cacheada (`php artisan config:cache`)
- [ ] Rutas cacheadas (`php artisan route:cache`)
- [ ] Vistas cacheadas (`php artisan view:cache`)
- [ ] Todos los archivos subidos vía FileZilla
- [ ] Permisos configurados (storage: 775, bootstrap/cache: 775)
- [ ] DocumentRoot configurado o `.htaccess` en raíz
- [ ] Enlace simbólico de storage creado
- [ ] Migraciones ejecutadas
- [ ] Aplicación accesible en `https://adrirubim.es/cp3/activitat_39/`
- [ ] Assets cargando correctamente
- [ ] Base de datos conectada

---

## 📞 Soporte CDMON

Si encuentras problemas específicos de CDMON:

1. Revisa la documentación de CDMON sobre Laravel
2. Contacta al soporte técnico de CDMON
3. Verifica los logs en `storage/logs/laravel.log`

---

---

## 📚 Documentación Relacionada

Para más información sobre despliegue en otros entornos, consulta:
- **[Guía General de Despliegue](DEPLOYMENT.md)** - Instrucciones para servidores con SSH y control completo

---

**Última actualización**: Enero 2026  
**Versión**: 1.0 - Específica para CDMON / Hosting Compartido
