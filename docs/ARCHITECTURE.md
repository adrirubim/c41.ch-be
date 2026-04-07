# Architecture

This document describes the **actual runtime architecture** of this repository (Laravel 13 + Inertia + React/TypeScript), focusing on end-to-end data flow and the cross-cutting concerns: **security**, **caching**, and **traceability**.

## High-level request → response flow

```
Request
  → Middleware (RequestId, Security headers/CSP, Inertia shared props, etc.)
  → Controller
  → (DTO) Input normalization
  → Service (business orchestration, domain events, internal caches)
  → Repository (queries, public caching helpers)
  → Model (Eloquent + relations + casts)
  → Response (Inertia HTML, JSON, redirects, or XML)
```

## Routing entrypoints

Laravel is configured via `bootstrap/app.php`:

- Web routes: `routes/web.php`
- API routes: `routes/api.php`
- Console commands: `routes/console.php`
- Health: `/up`

## Middleware pipeline (security + traceability + hydration)

Middleware is registered in `bootstrap/app.php` and appends:

- Web:
  - `App\Http\Middleware\RequestId`
  - `App\Http\Middleware\SecurityHeadersMiddleware`
  - `App\Http\Middleware\HandleAppearance`
  - `App\Http\Middleware\HandleInertiaRequests`
  - `Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets`
- API:
  - `App\Http\Middleware\RequestId`
  - `App\Http\Middleware\SecurityHeadersMiddleware`

### Traceability loop (backend → frontend)

`App\Http\Middleware\RequestId` guarantees an `X-Request-Id`, binds it as `request_id`, and echoes it back as a response header.

`App\Http\Middleware\HandleInertiaRequests` injects `requestId` into Inertia shared props, completing:

**`X-Request-Id` → `request_id` → Inertia `props.requestId` → React UI**

### Security headers / CSP

`App\Http\Middleware\SecurityHeadersMiddleware` is authoritative for CSP and security headers. Keep server-level policies minimal to avoid mismatches (see `docs/deployment/DEPLOYMENT.md`).

## Layers (responsibilities)

- Controllers (`app/Http/Controllers`): validate/authorize, build DTOs, delegate, return Inertia/JSON/redirect/XML
- DTOs (`app/Domain/*/DTO`): normalized, typed contracts (filters, upserts)
- Services (`app/Services`): orchestration, events, internal cache management
- Repositories (`app/Repositories`): query building + public caching helpers (notably `PostRepository`)

## Event-driven invalidation (Observers → Repository)

Public routes (`/blog`, `/blog/{slug}`, related posts, `sitemap.xml`) are cached in `App\Repositories\PostRepository`.

To guarantee freshness, Eloquent observers are registered in `App\Providers\AppServiceProvider`:

- `App\Observers\PostObserver`
- `App\Observers\CategoryObserver`

They call repository invalidation helpers so **any persistence mutation** invalidates the relevant public caches.

## SSR (optional)

SSR is controlled by `INERTIA_SSR_ENABLED` and `INERTIA_SSR_URL` (see `config/inertia.php`). The Docker setup builds standard Vite assets; SSR requires a separately deployed SSR server.

