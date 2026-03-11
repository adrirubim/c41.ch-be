# Utility Scripts

Helper scripts for deployment and maintenance in environments with limited access (for example, shared hosting without SSH).

## Repository maintenance

- **`update-license-year.sh`** — Updates the year range in `LICENSE` (keeps the initial year and sets the current year as the end of the range).  
  It runs automatically when publishing a release (see `.github/workflows/update-license-year.yml`) or can be executed manually:

  ```bash
  ./scripts/update-license-year.sh
  ```

## Local development usage

For local development, prefer the standard Artisan commands:

- **Application key:** `php artisan key:generate`
- **Migrations:** `php artisan migrate`
- **Seeders:** `php artisan db:seed`
- **Cache:** `php artisan optimize:clear`

## Shared hosting (no SSH)

If you deploy to a hosting provider where you **cannot** run `php artisan`, you can use the PHP scripts in this folder via the server’s PHP interpreter (for example, from a control panel that allows running PHP, or by uploading the scripts and calling them over HTTP with proper protection).

See `docs/DEPLOYMENT_CDMON.md` and `docs/TROUBLESHOOTING.md` for more details.
