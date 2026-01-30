# Security Policy

## Reporting a Vulnerability

If you discover a security issue, please report it by email to **adrianmorillasperez@gmail.com**. Do not open a public issue.

- Include a clear description and steps to reproduce.
- We will respond as soon as possible and keep you updated on the fix.

## Secure Setup

- **Never commit `.env`** — Use `.env.example` as a template; set `APP_KEY`, `DB_*`, and other secrets in your environment only.
- **Production** — Use `APP_DEBUG=false`, strong `APP_KEY`, and change or remove default seeded users.
- **Dependencies** — Run `composer update` and `npm update` periodically and review advisories.
