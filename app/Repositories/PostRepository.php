<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Domain\Post\DTO\PostFiltersData;
use App\Domain\Post\DTO\PostUpsertData;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Cache\TaggableStore;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostRepository
{
    private const KEYSET_PUBLIC_INDEX = 'cache_keys:public.posts.index';

    private const KEYSET_PUBLIC_SHOW = 'cache_keys:public.posts.show';

    private const KEYSET_PUBLIC_RELATED = 'cache_keys:public.posts.related';

    private const KEY_SITEMAP_XML = 'sitemap.xml.v1';

    private const TAG_PUBLIC_INDEX = 'public_posts_index';

    private const TAG_PUBLIC_SHOW = 'public_posts_show';

    private const TAG_PUBLIC_RELATED = 'public_posts_related';

    private const TAG_SITEMAP = 'sitemap';

    /**
     * Retrieve posts applying filters and pagination.
     *
     * @return LengthAwarePaginator<int, Post>
     */
    public function getFiltered(PostFiltersData $filters): LengthAwarePaginator
    {
        /** @var Builder<Post> $query */
        $query = Post::with(['user', 'categories'])->withoutTrashed();

        // Search
        if ($filters->search !== null) {
            $this->applyHybridSearch($query, $filters->search, $filters);
        }

        // Filter by category
        if ($filters->categoryId !== null) {
            $query->whereHas('categories', function (Builder $q) use ($filters): void {
                $q->where('categories.id', $filters->categoryId);
            });
        }

        if ($filters->published !== null) {
            $query->where('published', $filters->published);
        }

        if ($filters->featured !== null) {
            $query->where('featured', $filters->featured);
        }

        $query->orderBy($filters->sortBy, $filters->sortOrder);

        return $query->paginate($filters->perPage)->withQueryString();
    }

    /**
     * Cache wrapper for the most-hit public index route.
     *
     * Notes:
     * - This is intentionally short-lived to keep results fresh while reducing load.
     * - The paginator is cached as-is (including items/links). Query string is preserved.
     *
     * @return LengthAwarePaginator<int, Post>
     */
    public function getPublicFilteredCached(PostFiltersData $filters, int $ttlSeconds = 60): LengthAwarePaginator
    {
        $payload = $filters->toViewArray();
        $cacheKey = 'public.posts.index.'.md5(json_encode($payload));

        /** @var LengthAwarePaginator<int, Post> $paginator */
        $paginator = $this->remember(
            tags: [self::TAG_PUBLIC_INDEX],
            cacheKey: $cacheKey,
            ttlSeconds: $ttlSeconds,
            keyset: self::KEYSET_PUBLIC_INDEX,
            resolver: fn () => $this->getFiltered($filters),
        );

        return $paginator;
    }

    /**
     * Retrieve a published post by slug for public view (cached).
     */
    public function findPublishedBySlugCached(string $slug, int $ttlSeconds = 300): Post
    {
        $cacheKey = 'public.posts.show.'.md5($slug);

        /** @var Post $post */
        $post = $this->remember(
            tags: [self::TAG_PUBLIC_SHOW],
            cacheKey: $cacheKey,
            ttlSeconds: $ttlSeconds,
            keyset: self::KEYSET_PUBLIC_SHOW,
            resolver: function () use ($slug) {
                return Post::where('slug', $slug)
                    ->where('published', true)
                    ->with(['user', 'categories'])
                    ->withoutTrashed()
                    ->firstOrFail();
            }
        );

        return $post;
    }

    /**
     * Retrieve related published posts (cached) for a given post.
     *
     * @return Collection<int, Post>
     */
    public function getRelatedPublishedCached(Post $post, int $limit = 4, int $ttlSeconds = 300): Collection
    {
        $categoryIds = $post->categories->pluck('id')->map(static fn ($id) => (int) $id)->all();
        $cacheKey = 'public.posts.related.'.md5((string) $post->id.'|'.implode(',', $categoryIds).'|'.$limit);

        /** @var Collection<int, Post> $related */
        $related = $this->remember(
            tags: [self::TAG_PUBLIC_RELATED],
            cacheKey: $cacheKey,
            ttlSeconds: $ttlSeconds,
            keyset: self::KEYSET_PUBLIC_RELATED,
            resolver: function () use ($post, $categoryIds, $limit) {
                /** @var Builder<Post> $query */
                $query = Post::query()
                    ->where('published', true)
                    ->where('id', '!=', $post->id)
                    ->withoutTrashed();

                if ($categoryIds !== []) {
                    $query->whereHas('categories', function (Builder $q) use ($categoryIds): void {
                        $q->whereIn('categories.id', $categoryIds);
                    });
                }

                return $query
                    ->with(['user', 'categories'])
                    ->orderByDesc('published_at')
                    ->orderByDesc('created_at')
                    ->limit($limit)
                    ->get();
            }
        );

        return $related;
    }

    /**
     * Debounced view increment to reduce write contention under high traffic.
     *
     * Uses cache to ensure a single viewer doesn't increment repeatedly within the TTL.
     * Pass a stable viewer key (e.g. IP hash, session id, user id).
     */
    public function incrementViewsDebounced(Post $post, string $viewerKey, int $ttlSeconds = 600): void
    {
        $cacheKey = 'public.posts.viewed.'.$post->id.'.'.md5($viewerKey);

        if (Cache::add($cacheKey, 1, $ttlSeconds)) {
            $post->increment('views_count');
        }
    }

    /**
     * Sitemap source queries (controller delegates here).
     *
     * @return Collection<int, Post>
     */
    public function getSitemapPublishedPosts(): Collection
    {
        return Post::where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->withoutTrashed()
            ->orderBy('published_at', 'desc')
            ->get(['id', 'slug', 'updated_at', 'published_at']);
    }

    /**
     * @return Collection<int, Category>
     */
    public function getSitemapCategories(): Collection
    {
        return Category::withoutTrashed()
            ->get(['id', 'slug', 'updated_at']);
    }

    /**
     * Cached sitemap XML (24h). Controller calls this.
     */
    public function getSitemapXmlCached(int $ttlSeconds = 86400): string
    {
        /** @var string $xml */
        $xml = $this->remember(
            tags: [self::TAG_SITEMAP],
            cacheKey: self::KEY_SITEMAP_XML,
            ttlSeconds: $ttlSeconds,
            keyset: null,
            resolver: fn () => $this->buildSitemapXml(),
        );

        return $xml;
    }

    public function invalidatePublicIndexCache(): void
    {
        $this->flush([self::TAG_PUBLIC_INDEX], self::KEYSET_PUBLIC_INDEX);
    }

    public function invalidatePublicShowCacheForSlug(string $slug): void
    {
        $cacheKey = 'public.posts.show.'.md5($slug);
        $this->forget([self::TAG_PUBLIC_SHOW], self::KEYSET_PUBLIC_SHOW, $cacheKey);
    }

    public function invalidatePublicRelatedCache(): void
    {
        $this->flush([self::TAG_PUBLIC_RELATED], self::KEYSET_PUBLIC_RELATED);
    }

    public function invalidateSitemapCache(): void
    {
        $this->forget([self::TAG_SITEMAP], null, self::KEY_SITEMAP_XML);
    }

    /**
     * @template T
     *
     * @param  array<int, string>  $tags
     * @param  callable():T  $resolver
     * @return T
     */
    private function remember(array $tags, string $cacheKey, int $ttlSeconds, ?string $keyset, callable $resolver): mixed
    {
        if ($this->supportsTags()) {
            return Cache::tags($tags)->remember($cacheKey, $ttlSeconds, $resolver);
        }

        if ($keyset !== null) {
            $this->rememberKeyInSet($keyset, $cacheKey);
        }

        return Cache::remember($cacheKey, $ttlSeconds, $resolver);
    }

    /**
     * @param  array<int, string>  $tags
     */
    private function flush(array $tags, string $keyset): void
    {
        if ($this->supportsTags()) {
            Cache::tags($tags)->flush();

            return;
        }

        $keys = $this->getKeySet($keyset);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget($keyset);
    }

    /**
     * @param  array<int, string>  $tags
     */
    private function forget(array $tags, ?string $keyset, string $cacheKey): void
    {
        if ($this->supportsTags()) {
            Cache::tags($tags)->forget($cacheKey);

            return;
        }

        Cache::forget($cacheKey);

        if ($keyset !== null) {
            $this->removeKeyFromSet($keyset, $cacheKey);
        }
    }

    private function supportsTags(): bool
    {
        return Cache::getStore() instanceof TaggableStore;
    }

    /**
     * @return array<int, string>
     */
    private function getKeySet(string $keyset): array
    {
        $raw = Cache::get($keyset);

        return is_array($raw) ? array_values(array_unique(array_map('strval', $raw))) : [];
    }

    private function rememberKeyInSet(string $keyset, string $cacheKey): void
    {
        $keys = $this->getKeySet($keyset);
        $keys[] = $cacheKey;
        Cache::forever($keyset, array_values(array_unique($keys)));
    }

    private function removeKeyFromSet(string $keyset, string $cacheKey): void
    {
        $keys = array_values(array_filter(
            $this->getKeySet($keyset),
            static fn (string $key): bool => $key !== $cacheKey
        ));
        Cache::forever($keyset, $keys);
    }

    private function buildSitemapXml(): string
    {
        $posts = $this->getSitemapPublishedPosts();
        $categories = $this->getSitemapCategories();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        // Home page
        $xml .= '  <url>'."\n";
        $xml .= '    <loc>'.htmlspecialchars(route('home')).'</loc>'."\n";
        $xml .= '    <lastmod>'.now()->toAtomString().'</lastmod>'."\n";
        $xml .= '    <changefreq>daily</changefreq>'."\n";
        $xml .= '    <priority>1.0</priority>'."\n";
        $xml .= '  </url>'."\n";

        // Published posts
        foreach ($posts as $post) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.htmlspecialchars(route('public.posts.show', ['slug' => $post->slug])).'</loc>'."\n";
            $lastMod = $post->updated_at?->toAtomString() ?? now()->toAtomString();
            $xml .= '    <lastmod>'.$lastMod.'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.8</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        // Categories
        foreach ($categories as $category) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.htmlspecialchars(route('public.categories.show', ['slug' => $category->slug])).'</loc>'."\n";
            $lastMod = $category->updated_at?->toAtomString() ?? now()->toAtomString();
            $xml .= '    <lastmod>'.$lastMod.'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.6</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * @param  Builder<Post>  $query
     */
    private function applyHybridSearch(Builder $query, string $searchTerm, PostFiltersData $filters): void
    {
        $normalizedTerm = trim($searchTerm);
        if ($normalizedTerm === '') {
            return;
        }

        if ($this->canUseSemanticSearch($query)) {
            $semanticIds = $this->getSemanticCandidateIds($normalizedTerm, $filters);

            // Hybrid strategy: semantic first; if no candidates, fallback to LIKE.
            if ($semanticIds !== []) {
                $query->whereIn('posts.id', $semanticIds);
                $query->orderByDesc('published_at')->orderByDesc('created_at');

                return;
            }
        }

        $this->applyLikeSearch($query, $normalizedTerm);
    }

    /**
     * @param  Builder<Post>  $query
     */
    private function canUseSemanticSearch(Builder $query): bool
    {
        $isHybridEnabled = (bool) config('services.search.hybrid_enabled', false);
        $isSemanticEnabled = (bool) config('services.search.semantic_enabled', false);
        $driverName = $query->getModel()->getConnection()->getDriverName();

        return $isHybridEnabled && $isSemanticEnabled && $driverName === 'pgsql';
    }

    /**
     * @param  Builder<Post>  $query
     */
    private function applyLikeSearch(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm): void {
            $q->where('title', 'like', '%'.$searchTerm.'%')
                ->orWhere('content', 'like', '%'.$searchTerm.'%')
                ->orWhere('excerpt', 'like', '%'.$searchTerm.'%')
                ->orWhere('slug', 'like', '%'.$searchTerm.'%')
                ->orWhereJsonContains('tags', $searchTerm)
                ->orWhereHas('categories', function (Builder $catQuery) use ($searchTerm): void {
                    $catQuery->where('name', 'like', '%'.$searchTerm.'%');
                })
                ->orWhereHas('user', function (Builder $userQuery) use ($searchTerm): void {
                    $userQuery->where('name', 'like', '%'.$searchTerm.'%')
                        ->orWhere('email', 'like', '%'.$searchTerm.'%');
                });
        });
    }

    /**
     * @return array<int, int>
     */
    private function getSemanticCandidateIds(string $searchTerm, PostFiltersData $filters): array
    {
        /** @var Builder<Post> $semanticQuery */
        $semanticQuery = Post::query()
            ->select('posts.id')
            ->withoutTrashed()
            ->whereRaw(
                "to_tsvector('simple', coalesce(posts.title,'') || ' ' || coalesce(posts.excerpt,'') || ' ' || coalesce(posts.content,'')) @@ plainto_tsquery('simple', ?)",
                [$searchTerm]
            );

        if ($filters->published !== null) {
            $semanticQuery->where('posts.published', $filters->published);
        }

        if ($filters->categoryId !== null) {
            $semanticQuery->whereHas('categories', function (Builder $q) use ($filters): void {
                $q->where('categories.id', $filters->categoryId);
            });
        }

        if ($filters->featured !== null) {
            $semanticQuery->where('posts.featured', $filters->featured);
        }

        return $semanticQuery
            ->orderByRaw(
                "ts_rank(to_tsvector('simple', coalesce(posts.title,'') || ' ' || coalesce(posts.excerpt,'') || ' ' || coalesce(posts.content,'')), plainto_tsquery('simple', ?)) desc",
                [$searchTerm]
            )
            ->limit(150)
            ->pluck('posts.id')
            ->map(static fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Retrieve a post by ID with related user and categories.
     */
    public function findById(int $id): ?Post
    {
        return Post::with(['user', 'categories'])->find($id);
    }

    /**
     * Retrieve a post by slug with related user and categories.
     */
    public function findBySlug(string $slug): ?Post
    {
        return Post::with(['user', 'categories'])->where('slug', $slug)->first();
    }

    /**
     * Create a new post.
     */
    public function create(PostUpsertData $data): Post
    {
        return Post::create($data->toPersistenceArray());
    }

    /**
     * Update a post.
     */
    public function update(Post $post, PostUpsertData $data): bool
    {
        return $post->update($data->toPersistenceArray());
    }

    /**
     * Soft delete a post.
     */
    public function delete(Post $post): bool
    {
        return (bool) $post->delete();
    }

    /**
     * Get recent posts.
     *
     * @return Collection<int, Post>
     */
    public function getRecent(int $limit = 5): Collection
    {
        return Post::select('id', 'title', 'slug', 'published_at', 'user_id', 'created_at')
            ->with(['user:id,name,email', 'categories:id,name,slug,color'])
            ->where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->withoutTrashed()
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get popular posts
     *
     * @return Collection<int, Post>
     */
    public function getPopular(int $limit = 5): Collection
    {
        return Post::select('id', 'title', 'slug', 'views_count', 'published_at', 'user_id', 'created_at')
            ->with(['user:id,name,email', 'categories:id,name,slug,color'])
            ->where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->withoutTrashed()
            ->orderBy('views_count', 'desc')
            ->limit($limit)
            ->get();
    }
}
