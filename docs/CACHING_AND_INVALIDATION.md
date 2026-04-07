# Caching and Invalidation

This document defines the **real caching contract** of this repository: what is cached, how keys/tags are structured, and **exactly what invalidates what**.

The goal is deterministic behavior:

- reduce load on high-traffic public endpoints
- keep content **fresh** (no stale pages after mutations)
- work on cache stores **with or without tag support**

## Overview

Caching is implemented in two layers:

1. **Public content caching (Repository-owned)**  
   Implemented in `App\Repositories\PostRepository` for:
   - public blog index (`/blog`)
   - public post show (`/blog/{slug}`)
   - related posts module
   - sitemap (`/sitemap.xml`)

2. **Dashboard + category lists caching (Service/controller-owned)**  
   Implemented via `Cache::remember()` / `Cache::flexible()`:
   - dashboard stats/recent/popular/distribution
   - category lists (`categories.list`, `categories.with_post_count`)

## Public caching: `PostRepository`

`PostRepository` caches read-heavy public views using a strategy that prefers **cache tags** but safely falls back to a **keyset registry** when tags are not available.

### Tag support detection

`PostRepository` detects tag support at runtime:

- If the cache store implements `Illuminate\Cache\TaggableStore`, it uses `Cache::tags([...])->remember(...)`.
- Otherwise, it uses `Cache::remember(...)` and maintains a “keyset” list of keys to later invalidate by iterating the list.

### Tags, keysets, and keys

**Tags (preferred invalidation mechanism):**

- `public_posts_index`
- `public_posts_show`
- `public_posts_related`
- `sitemap`

**Keysets (fallback invalidation mechanism when tags are unavailable):**

- `cache_keys:public.posts.index`
- `cache_keys:public.posts.show`
- `cache_keys:public.posts.related`

**Concrete cache keys:**

- Public index:
  - `public.posts.index.{md5(json(filters))}`
- Public post show:
  - `public.posts.show.{md5(slug)}`
- Related posts:
  - `public.posts.related.{md5(postId|categoryIds|limit)}`
- Debounced view counter:
  - `public.posts.viewed.{postId}.{md5(viewerKey)}`
- Sitemap XML:
  - `sitemap.xml.v1`

### TTLs (time-to-live)

Configured in `PostRepository` call sites / defaults:

- **Public index**: 60 seconds (short-lived by design)
- **Public show**: 300 seconds
- **Related posts**: 300 seconds
- **Sitemap XML**: 86400 seconds (24 hours)
- **View debounce**: 600 seconds

### Invalidation API (repository methods)

The repository exposes explicit invalidation methods:

- `invalidatePublicIndexCache()`
- `invalidatePublicShowCacheForSlug(string $slug)`
- `invalidatePublicRelatedCache()`
- `invalidateSitemapCache()`

Each method:

- invalidates via **tag flush/forget** when tags are supported
- otherwise invalidates via **keyset iteration** (for the “flush” style) or key removal from the keyset (for the “forget” style)

## Event-driven invalidation: Observers

To guarantee freshness independent of call site, the project registers Eloquent Observers in `App\Providers\AppServiceProvider`:

- `Post::observe(PostObserver::class)`
- `Category::observe(CategoryObserver::class)`

These Observers invalidate the **public caches** owned by `PostRepository`.

### `PostObserver` (post mutations)

File: `app/Observers/PostObserver.php`

Triggers on:

- `created`
- `updated`
- `deleted` (soft delete)
- `restored`
- `forceDeleted`

Invalidation performed:

- **Public index**: always invalidated (ordering/filters depend on post attributes)
- **Related posts**: always invalidated (category membership and recency affect “related”)
- **Sitemap**: always invalidated (post URLs and timestamps are present)
- **Public show**:
  - invalidates current `post->slug` (when present)
  - on `updated`, also invalidates the **previous slug** (from `getOriginal('slug')`) to prevent stale pages after a slug rename

### `CategoryObserver` (category mutations)

File: `app/Observers/CategoryObserver.php`

Triggers on:

- `created`
- `updated`
- `deleted` (soft delete)
- `restored`
- `forceDeleted`

Invalidation performed:

- **Category list caches**:
  - `categories.list`
  - `categories.with_post_count`
- **Public index**: invalidated (category filters and navigation lists)
- **Related posts**: invalidated (category-driven similarity)
- **Sitemap**: invalidated (category URLs + timestamps are present)

### Why Observers (and not controllers/services) are the guarantee

- Controllers and services can miss edge cases (bulk updates, deletes, restores, seeders, etc.).
- Observers run on **persistence events**, so they are the best layer to guarantee “no stale public content” invariants.
- `PostRepository` remains the single source of truth for key/tag strategy; Observers call its invalidation API.

## Dashboard + internal caches

These caches are separate from the public cache layer:

### Dashboard keys (admin)

Invalidated by `PostService` and `CategoryService`:

- `dashboard.stats`
- `dashboard.recent_posts`
- `dashboard.popular_posts`
- `dashboard.categories_distribution`

### Category list keys

Provided by `CategoryService`:

- `categories.list` (via `Cache::flexible`)
- `categories.with_post_count` (via `Cache::flexible`)

`CategoryObserver` also invalidates these so they remain correct even if categories change through non-service call sites.

## Sitemap caching

Sitemap is cached in `PostRepository` under the key `sitemap.xml.v1` (tag `sitemap` when supported).

Invalidation sources:

- `PostObserver` (any post mutation)
- `CategoryObserver` (any category mutation)

This ensures sitemap never lags behind published content changes beyond the minimal “in-flight” window.

