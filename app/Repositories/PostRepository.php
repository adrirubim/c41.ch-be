<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostRepository
{
    /**
     * Obtener posts con filtros y paginación
     */
    public function getFiltered(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::with(['user', 'categories'])->withoutTrashed();

        // Search
        if (! empty($filters['search'])) {
            $searchTerm = $filters['search'];
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

        // Filtro por categoría
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
