<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Domain\Post\DTO\PostFiltersData;
use App\Domain\Post\DTO\PostUpsertData;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PostRepository
{
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
