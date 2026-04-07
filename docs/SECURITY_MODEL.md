# Security Model

This document describes the **security control plane** of this repository (Laravel 13 + Inertia), based on the code as implemented.

## Threat model (what we actively defend)

- **XSS**: user-provided HTML exists (posts), so sanitization and CSP are mandatory.
- **Abuse / brute force**: login, AI endpoints, search, and public content must be rate limited.
- **Privilege escalation**: admin-only areas must be deny-by-default and enforced at multiple layers.
- **Data loss**: soft deletes + backups and media cleanup reduce operational risk (see ops docs).

## Request pipeline security controls

### 1) RequestId (traceability)

`App\Http\Middleware\RequestId` ensures:

- Incoming `X-Request-Id` is accepted (or generated if missing)
- `request_id` is bound into the service container
- Response echoes `X-Request-Id`

This enables reliable correlation of:

- client reports (`POST /api/client-error`)
- infra checks (`GET /api/health`)
- production exception logging (see `bootstrap/app.php`)

### 2) Security headers and CSP

`App\Http\Middleware\SecurityHeadersMiddleware` sets a strict baseline:

- `Content-Security-Policy`: deny-by-default, with explicit allowances
  - **Prod**: no `unsafe-eval`, no dev websockets
  - **Local/debug**: allows Vite HMR (`localhost:5173`) and `unsafe-eval` for tooling
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Rate limiting (abuse protection)

Rate limiters are defined in two providers:

### App-level limiters (`App\Providers\AppServiceProvider`)

- **`api_general`**: 120/min, keyed by user id if authenticated, otherwise IP
- **`api_expensive`**: 15/min, keyed by user id or IP
- **`public_content`**: 240/min, keyed by IP

### Auth & sensitive actions (`App\Providers\FortifyServiceProvider`)

- **`login`**: configurable attempts/min (default template sets high values for dev)
- **`two-factor`**: configurable attempts/min
- **`posts`**: 10/min (mutations + uploads)
- **`categories`**: 5/min (category mutations)
- **`search`**: 30/min
- **`ai-editorial`**: configurable attempts/min (default 6)

### Where throttles are applied (routes)

`routes/web.php` applies throttling explicitly:

- Public pages and sitemap use `throttle:public_content`
- Post list/search adds `throttle:search` and `throttle:api_expensive`
- AI suggestions uses `throttle:ai-editorial` + `throttle:api_expensive`
- Category mutations use `throttle:categories`
- Post mutations + image upload use `throttle:posts`

`routes/api.php` applies:

- `throttle:api_general` to `/api/health` and `/api/client-error`

## Authorization model (deny-by-default)

This repo enforces authorization in layers:

### 1) Route-level access (hard gate)

Admin area is gated with:

- `auth` + `verified`
- `App\Http\Middleware\EnsureAdmin`

`EnsureAdmin`:

- aborts with 403 if no user
- redirects non-admin users to the public blog index

This prevents accidental exposure of dashboard URLs even before policy checks.

### 2) Policy-level access (fine-grained)

Policies live in `app/Policies` and are enforced via `can:*` middleware.

#### `CategoryPolicy` (admin-only)

All category management capabilities are **deny-by-default for non-admin**:

- `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` → require `user.is_admin === true`

Routes under `dashboard/categories/*` also apply `can:*` middleware accordingly.

#### `PostPolicy` (owner-or-admin, plus feature-flag gating)

- `update/delete/restore`: **post owner OR admin**
- `forceDelete/assignAuthor`: **admin only**
- `useEditorialSuggestions`:
  - hard deny if `services.ai.enabled === false`
  - if `services.ai.editorial_admin_only === true`, admin-only

This implements “deny-by-default” for AI features via configuration.

## Input sanitization (XSS hardening)

### Post HTML

`App\Models\Post` sanitizes:

- `content`
- `excerpt`

on the Eloquent `saving` event via `HtmlPurifierService`.

This ensures content is normalized before it can be rendered publicly.

## Production-safe error handling

In `bootstrap/app.php`, production exception rendering:

- logs critical-path exceptions with `request_id`
- masks JSON error responses for clients in production (stable, non-leaky messages)

## Operational security notes

- Keep `APP_DEBUG=false` in production.
- Use `CACHE_STORE=redis` in production when possible (also enables tag support in many deployments).
- Ensure `storage/` and `bootstrap/cache` are writable by the runtime user.

