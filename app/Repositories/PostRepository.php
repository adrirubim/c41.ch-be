<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostRepository
{
    /**
     * Retrieve posts applying filters and pagination.
     */
    public function getFiltered(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::with(['user', 'categories'])->withoutTrashed();

        // Search
        if (! empty($filters['search'])) {
            $this->applyHybridSearch($query, (string) $filters['search'], $filters);
        }

        // Filter by category
        if (! empty($filters['category'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category']);
            });
        }

        // Filtro por estado publicado
        if (isset($filters['published']) && $filters['published'] !== null) {
            $published = $filters['published'];
            if (is_string($published)) {
                $published = $published === 'true' || $published === '1';
            }
            $query->where('published', (bool) $published);
        }

        // Filtro por destacado
        if (isset($filters['featured']) && $filters['featured'] !== null && $filters['featured'] !== '') {
            $featured = $filters['featured'];
            if (is_string($featured)) {
                $featured = $featured === 'true' || $featured === '1';
            }
            $query->where('featured', (bool) $featured);
        }

        // Ordenamiento
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Validar per_page
        $perPage = in_array($perPage, [15, 25, 50, 100]) ? $perPage : 15;

        return $query->paginate($perPage)->withQueryString();
    }

    private function applyHybridSearch(Builder $query, string $searchTerm, array $filters): void
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
                $query->orderByRaw($this->buildIdPriorityOrderSql($semanticIds));

                return;
            }
        }

        $this->applyLikeSearch($query, $normalizedTerm);
    }

    private function canUseSemanticSearch(Builder $query): bool
    {
        $isHybridEnabled = (bool) config('services.search.hybrid_enabled', false);
        $isSemanticEnabled = (bool) config('services.search.semantic_enabled', false);
        $driverName = $query->getConnection()->getDriverName();

        return $isHybridEnabled && $isSemanticEnabled && $driverName === 'pgsql';
    }

    private function applyLikeSearch(Builder $query, string $searchTerm): void
    {
        $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'like', '%'.$searchTerm.'%')
                ->orWhere('content', 'like', '%'.$searchTerm.'%')
                ->orWhere('excerpt', 'like', '%'.$searchTerm.'%')
                ->orWhere('slug', 'like', '%'.$searchTerm.'%')
                ->orWhereJsonContains('tags', $searchTerm)
                ->orWhereHas('categories', function ($catQuery) use ($searchTerm) {
                    $catQuery->where('name', 'like', '%'.$searchTerm.'%');
                })
                ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'like', '%'.$searchTerm.'%')
                        ->orWhere('email', 'like', '%'.$searchTerm.'%');
                });
        });
    }

    /**
     * @return array<int, int>
     */
    private function getSemanticCandidateIds(string $searchTerm, array $filters): array
    {
        $ftsVector = "to_tsvector('simple', coalesce(posts.title,'') || ' ' || coalesce(posts.excerpt,'') || ' ' || coalesce(posts.content,''))";
        $ftsQuery = "plainto_tsquery('simple', ?)";

        $semanticQuery = Post::query()
            ->select('posts.id')
            ->withoutTrashed()
            ->whereRaw("{$ftsVector} @@ {$ftsQuery}", [$searchTerm]);

        if (isset($filters['published']) && $filters['published'] !== null) {
            $published = $filters['published'];
            if (is_string($published)) {
                $published = $published === 'true' || $published === '1';
            }
            $semanticQuery->where('posts.published', (bool) $published);
        }

        if (! empty($filters['category'])) {
            $semanticQuery->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category']);
            });
        }

        if (isset($filters['featured']) && $filters['featured'] !== null && $filters['featured'] !== '') {
            $featured = $filters['featured'];
            if (is_string($featured)) {
                $featured = $featured === 'true' || $featured === '1';
            }
            $semanticQuery->where('posts.featured', (bool) $featured);
        }

        return $semanticQuery
            ->orderByRaw("ts_rank({$ftsVector}, {$ftsQuery}) desc", [$searchTerm])
            ->limit(150)
            ->pluck('posts.id')
            ->map(static fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Build deterministic ranking order from semantic candidate IDs.
     *
     * @param  array<int, int>  $ids
     */
    private function buildIdPriorityOrderSql(array $ids): string
    {
        $cases = [];
        foreach ($ids as $position => $id) {
            $rank = $position + 1;
            $cases[] = "when {$id} then {$rank}";
        }

        $fallbackRank = count($ids) + 1;

        return 'case posts.id '.implode(' ', $cases)." else {$fallbackRank} end";
    }

    /**
     * Obtener un post por ID con relaciones
     */
    public function findById(int $id): ?Post
    {
        return Post::with(['user', 'categories'])->find($id);
    }

    /**
     * Obtener un post por slug con relaciones
     */
    public function findBySlug(string $slug): ?Post
    {
        return Post::with(['user', 'categories'])->where('slug', $slug)->first();
    }

    /**
     * Crear un nuevo post
     */
    public function create(array $data): Post
    {
        return Post::create($data);
    }

    /**
     * Actualizar un post
     */
    public function update(Post $post, array $data): bool
    {
        return $post->update($data);
    }

    /**
     * Eliminar un post (soft delete)
     */
    public function delete(Post $post): bool
    {
        return $post->delete();
    }

    /**
     * Obtener posts recientes
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
