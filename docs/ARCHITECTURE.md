# Architecture

This document describes the **actual runtime architecture** of this repository (Laravel 13 + Inertia + React/TypeScript), focusing on the end-to-end data flow and the key cross-cutting concerns: **security**, **caching**, and **traceability**.

## High-level flow

At a high level, requests follow this layered pattern:

```
Request
  → Middleware (RequestId, CSP/Security headers, Inertia shared props, etc.)
  → Controller
  → (DTO) Input normalization
  → Service (business orchestration, domain events, admin caches)
  → Repository (queries, public caching helpers)
  → Model (Eloquent + relations + attribute casting)
  → Response (Inertia HTML, JSON, redirects, or XML)
```

## Routing entrypoints

Laravel is configured via `bootstrap/app.php` (Laravel 13 style `Application::configure()`):

- **Web routes**: `routes/web.php`
- **API routes**: `routes/api.php`
- **Console routes**: `routes/console.php`
- **Health**: `/up` (framework health route)

### Web vs API responses

- **Web** routes primarily return **Inertia responses** (HTML + page props) and redirect on mutations.
- **API** routes under `routes/api.php` return **JSON** and are designed for infra checks and error reporting:
  - `GET /api/health`
  - `POST /api/client-error`

## Middleware pipeline (security + traceability)

Middleware is appended centrally in `bootstrap/app.php`.

### RequestId (traceability)

`App\Http\Middleware\RequestId` guarantees every request has an `X-Request-Id`:

- Reads `X-Request-Id` from the incoming request header if present.
- Otherwise generates a UUID.
- Stores it in the service container as `request_id`.
- Echoes it back on the response header (`X-Request-Id`).

This makes it possible to correlate:

- Browser/network requests → response headers (`X-Request-Id`)
- Backend JSON contracts that include `request_id` (e.g. `/api/health`)
- Server-side logs (most critical-path logging includes `request_id`)

### Security headers / CSP

`App\Http\Middleware\SecurityHeadersMiddleware` sets a strict baseline:

- Deny framing (`frame-ancestors 'none'`, `X-Frame-Options: DENY`)
- No object embedding (`object-src 'none'`)
- Strict referrer policy (`Referrer-Policy: strict-origin-when-cross-origin`)
- CSP differs between **prod** and **local/debug** to allow Vite HMR only in dev

### Inertia shared props (hydration boundary)

`App\Http\Middleware\HandleInertiaRequests` is the hydration “bridge”:

- Defines shared props via `share(Request $request): array`
- Injects `requestId` into page props:
  - `requestId = app()->bound('request_id') ? app('request_id') : null`

On the frontend, this is typed as part of `SharedData` (`resources/js/types/index.d.ts`):

```ts
requestId: string | null;
```

That completes the “traceability loop”:

**Request header `X-Request-Id` → container `request_id` → Inertia `props.requestId` → React UI**.

## Controllers → DTOs → Services → Repositories

This repo uses a clear separation of responsibilities:

### Controllers

Controllers live in `app/Http/Controllers` and typically:

- Parse request params (or use `FormRequest` for validation/authorization).
- Create DTOs for normalized input (e.g. `PostFiltersData`).
- Call services/repositories.
- Return:
  - `Inertia::render(...)` for pages
  - `redirect()->route(...)->with(...)` for mutations
  - `response()->json(...)` for JSON endpoints
  - `response($xml)->header('Content-Type', ...)` for the sitemap

### DTOs (input normalization)

DTOs live under `app/Domain/*/DTO/*` and provide a stable contract between:

- controllers / requests
- services / repositories

Example roles:

- Filter DTOs for query + pagination consistency (`PostFiltersData`)
- Upsert DTOs for create/update (`PostUpsertData`, `CategoryUpsertData`)

### Services (orchestration + admin cache)

Services in `app/Services`:

- Orchestrate multi-step business logic.
- Dispatch domain events (e.g. `PostCreated`, `CategoryUpdated`).
- Invalidate **admin/dashboard** caches (e.g. `dashboard.*`) and some shared caches.

### Repositories (data access + public cache helpers)

Repositories in `app/Repositories` encapsulate:

- Eloquent query building
- eager loading strategy
- the public caching strategy (notably in `PostRepository`)

For caching and invalidation details, see `docs/CACHING_AND_INVALIDATION.md`.

## Event-driven invalidation (Observers → Repository)

The public-facing pages (`/blog`, `/blog/{slug}`, related posts, and `sitemap.xml`) are cached in `App\Repositories\PostRepository`.

To guarantee cache freshness, this repo uses **Eloquent Observers** registered in `App\Providers\AppServiceProvider`:

- `App\Observers\PostObserver`
- `App\Observers\CategoryObserver`

### What the Observers do

- **`PostObserver`** invalidates:
  - Public index cache (filters + pagination)
  - Public related-posts cache
  - Sitemap cache
  - Public show cache for the current slug, and (on updates) also the **previous slug** to avoid stale content after slug changes

- **`CategoryObserver`** invalidates:
  - Category list caches (`categories.list`, `categories.with_post_count`)
  - Public index cache (category filters)
  - Public related-posts cache (category-based)
  - Sitemap cache (category URLs and timestamps)

### Why this is the “correct” invalidation layer

- Controllers and services should focus on **business intent** (create/update/delete).
- Repositories own the **cache key/tag strategy**.
- Observers provide a single, centralized guarantee that **any persistence mutation** (including soft deletes/restores) triggers the required invalidations, independent of the call site.

## Frontend architecture (Inertia + React + SSR)

### Inertia pages and shared props

- Pages live in `resources/js/pages/**`
- The server returns `Inertia::render('<page>', props)` and the client hydrates it.
- Shared props come from `HandleInertiaRequests::share()` and are typed by `SharedData`.

### SSR (optional)

Server-side rendering is optional and controlled by `config/inertia.php`:

- `INERTIA_SSR_ENABLED` (default false)
- `INERTIA_SSR_URL` (default `http://127.0.0.1:13714`)

The SSR entrypoint is `resources/js/ssr.tsx`, built by Vite via `vite.config.ts`.

## Error handling (production masking)

`bootstrap/app.php` registers production-safe exception rendering:

- Logs critical-path exceptions at `critical` level for key public/infra paths.
- Masks JSON error details for clients in production and returns a stable shape with `request_id`.

## Where to look next

- **API contracts**: `docs/API.md`
- **Caching + invalidation**: `docs/CACHING_AND_INVALIDATION.md`
- **Production operations**: `docs/PRODUCTION_CHECKLIST.md` and `routes/console.php`

