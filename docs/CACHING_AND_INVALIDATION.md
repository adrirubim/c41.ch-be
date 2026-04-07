# Caching and Invalidation

This document defines the caching contract of this repository: what is cached, how keys/tags are structured, and what invalidates what.

## Public caching: `App\Repositories\PostRepository`

Public content caching is implemented in `app/Repositories/PostRepository.php` for:

- `GET /blog` (public index)
- `GET /blog/{slug}` (public show)
- related posts module
- `GET /sitemap.xml` (XML)

### Tags vs keyset fallback

`PostRepository` prefers cache tags when available (stores implementing `Illuminate\Cache\TaggableStore`), otherwise it falls back to a **keyset registry** of cache keys so it can invalidate by iterating known keys.

**Tags:**

- `public_posts_index`
- `public_posts_show`
- `public_posts_related`
- `sitemap`

**Keysets (fallback):**

- `cache_keys:public.posts.index`
- `cache_keys:public.posts.show`
- `cache_keys:public.posts.related`

**Concrete keys (as implemented):**

- `public.posts.index.{md5(json(filters))}`
- `public.posts.show.{md5(slug)}`
- `public.posts.related.{md5(postId|categoryIds|limit)}`
- `public.posts.viewed.{postId}.{md5(viewerKey)}`
- `sitemap.xml.v1`

### TTLs (defaults)

- public index: 60s
- public show: 300s
- related posts: 300s
- sitemap: 86400s
- view debounce: 600s

## Invalidation API (repository helpers)

`PostRepository` exposes explicit invalidation methods:

- `invalidatePublicIndexCache()`
- `invalidatePublicShowCacheForSlug(string $slug)`
- `invalidatePublicRelatedCache()`
- `invalidateSitemapCache()`

## Event-driven invalidation (Observers)

Observers are registered in `App\Providers\AppServiceProvider`:

- `Post::observe(PostObserver::class)`
- `Category::observe(CategoryObserver::class)`

### `PostObserver`

File: `app/Observers/PostObserver.php`

On `created/updated/deleted/restored/forceDeleted`, it invalidates:

- public index cache
- related posts cache
- sitemap cache
- public show cache for the current slug
- on `updated`, also the **original slug** (from `getOriginal('slug')`) to avoid stale pages after a slug rename

### `CategoryObserver`

File: `app/Observers/CategoryObserver.php`

On `created/updated/deleted/restored/forceDeleted`, it invalidates:

- `categories.list` and `categories.with_post_count`
- public index cache (category filters/navigation)
- related posts cache
- sitemap cache

