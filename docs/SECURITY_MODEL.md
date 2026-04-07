# Security Model

This document describes the security control plane of this repository (Laravel 13 + Inertia), based on the code as implemented.

## Core controls

### RequestId (traceability)

`App\Http\Middleware\RequestId`:

- guarantees an `X-Request-Id` for every request
- binds it as `request_id` in the service container
- echoes it back as the `X-Request-Id` response header

### Security headers & CSP

`App\Http\Middleware\SecurityHeadersMiddleware` is the authoritative source of CSP and security headers. Deployment configs should avoid duplicating CSP to prevent mismatches (see `docs/deployment/DEPLOYMENT.md`).

## Rate limiting

### App-level rate limiters (`App\Providers\AppServiceProvider`)

- `api_general`: 120/min (user id or IP)
- `api_expensive`: 15/min (user id or IP)
- `public_content`: 240/min (IP)

### Fortify rate limiters (`App\Providers\FortifyServiceProvider`)

- `login`: attempts/min from `fortify.login_rate_limit_attempts` (default 5)
- `two-factor`: attempts/min from `fortify.two_factor_rate_limit_attempts` (default 5)
- `posts`: 10/min
- `categories`: 5/min
- `search`: 30/min
- `ai-editorial`: attempts/min from `services.ai.editorial_rate_limit_attempts` (default 6)

### Where throttles are applied

- Public routes (`/`, `/blog*`, `/categories*`, `sitemap.xml`): `throttle:public_content`
- Admin post index: `throttle:search` + `throttle:api_expensive`
- AI editorial suggestions: `throttle:ai-editorial` + `throttle:api_expensive`
- Post mutations + upload: `throttle:posts`
- Category mutations: `throttle:categories`
- API infra: `/api/health`, `/api/client-error`: `throttle:api_general`

## Authorization (deny-by-default)

- Admin area is gated with `auth`, `verified`, plus `App\Http\Middleware\EnsureAdmin`.
- Policies in `app/Policies` are enforced via `can:*` middleware:
  - `CategoryPolicy`: admin-only CRUD
  - `PostPolicy`: owner-or-admin, plus config-gated AI capability

