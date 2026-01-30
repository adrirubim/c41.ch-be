<?php

namespace App\Services;

use App\Models\Post;
use App\Repositories\PostRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostService
{
    public function __construct(
        private PostRepository $repository
    ) {}

    /**
     * Get posts with filters
     */
    public function getFiltered(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getFiltered($filters, $perPage);
    }

    /**
     * Create a new post
     */
    public function create(array $data, ?array $categoryIds = null): Post
    {
        $post = $this->repository->create($data);

        // Assign categories if provided
        if ($categoryIds !== null) {
            $post->categories()->sync($categoryIds);
        }

        // Trigger event
        event(new \App\Events\PostCreated($post));

        // Clear cache
        $this->clearCache();

        return $post;
    }

    /**
     * Update a post
     */
    public function update(Post $post, array $data, ?array $categoryIds = null): bool
    {
        $updated = $this->repository->update($post, $data);

        // Update categories if provided
        if ($categoryIds !== null) {
            if (empty($categoryIds)) {
                $post->categories()->detach();
            } else {
                $post->categories()->sync($categoryIds);
            }
        }

        // Trigger event
        if ($updated) {
            event(new \App\Events\PostUpdated($post->fresh()));
            $this->clearCache();
        }

        return $updated;
    }

    /**
     * Delete a post
     */
    public function delete(Post $post): bool
    {
        $deleted = $this->repository->delete($post);

        // Trigger event
        if ($deleted) {
            event(new \App\Events\PostDeleted($post));
            $this->clearCache();
        }

        return $deleted;
    }

    /**
     * Get a post by ID
     */
    public function findById(int $id): ?Post
    {
        return $this->repository->findById($id);
    }

    /**
     * Get a post by slug
     */
    public function findBySlug(string $slug): ?Post
    {
        return $this->repository->findBySlug($slug);
    }

    /**
     * Get recent posts
     */
    public function getRecent(int $limit = 5)
    {
        return $this->repository->getRecent($limit);
    }

    /**
     * Get popular posts
     */
    public function getPopular(int $limit = 5)
    {
        return $this->repository->getPopular($limit);
    }

    /**
     * Limpiar caché relacionado con posts
     */
    private function clearCache(): void
    {
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.recent_posts');
        Cache::forget('dashboard.popular_posts');
        Cache::forget('dashboard.categories_distribution');
    }
}
