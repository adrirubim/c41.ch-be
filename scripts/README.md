# Scripts de utilidad

Scripts y ayudas para despliegue y mantenimiento en entornos con acceso limitado (por ejemplo, hosting sin SSH).

## Uso local / desarrollo

En desarrollo se recomienda usar los comandos de Artisan estándar:

- **Clave de aplicación:** `php artisan key:generate`
- **Migraciones:** `php artisan migrate`
- **Seeders:** `php artisan db:seed`
- **Caché:** `php artisan optimize:clear`

## Hosting compartido (sin SSH)

Si despliegas en un hosting donde no puedes ejecutar `php artisan`, puedes usar los scripts PHP de esta carpeta vía el intérprete PHP del servidor (por ejemplo, desde un panel que permita ejecutar PHP o subiendo los scripts y llamándolos por HTTP con las debidas protecciones).

Consulta la documentación en `docs/DEPLOYMENT_CDMON.md` y `docs/TROUBLESHOOTING.md`.
