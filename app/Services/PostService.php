<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Post\DTO\PostFiltersData;
use App\Domain\Post\DTO\PostUpsertData;
use App\Events\PostCreated;
use App\Events\PostDeleted;
use App\Events\PostUpdated;
use App\Models\Post;
use App\Repositories\PostRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostService
{
    public function __construct(
        private PostRepository $repository
    ) {}

    /**
     * Get posts with filters
     *
     * @return LengthAwarePaginator<int, Post>
     */
    public function getFiltered(PostFiltersData $filters): LengthAwarePaginator
    {
        return $this->repository->getFiltered($filters);
    }

    /**
     * Create a new post
     *
     * @param  array<int, int>|null  $categoryIds
     */
    public function create(PostUpsertData $data, ?array $categoryIds = null): Post
    {
        $post = $this->repository->create($data);

        // Assign categories if provided
        if ($categoryIds !== null) {
            $post->categories()->sync($categoryIds);
        }

        // Trigger event
        event(new PostCreated($post));

        // Clear cache
        $this->clearCache();

        return $post;
    }

    /**
     * Update a post
     *
     * @param  array<int, int>|null  $categoryIds
     */
    public function update(Post $post, PostUpsertData $data, ?array $categoryIds = null): bool
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
            $post->refresh();
            event(new PostUpdated($post));
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
            event(new PostDeleted($post));
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
     *
     * @return Collection<int, Post>
     */
    public function getRecent(int $limit = 5): Collection
    {
        /** @var Collection<int, Post> $posts */
        $posts = Cache::flexible('dashboard.recent_posts', [300, 600], function () use ($limit): Collection {
            return $this->repository->getRecent($limit);
        });

        return $posts;
    }

    /**
     * Get popular posts
     *
     * @return Collection<int, Post>
     */
    public function getPopular(int $limit = 5): Collection
    {
        /** @var Collection<int, Post> $posts */
        $posts = Cache::flexible('dashboard.popular_posts', [300, 600], function () use ($limit): Collection {
            return $this->repository->getPopular($limit);
        });

        return $posts;
    }

    /**
     * Clear cache entries related to posts.
     */
    private function clearCache(): void
    {
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.recent_posts');
        Cache::forget('dashboard.popular_posts');
        Cache::forget('dashboard.categories_distribution');
    }
}
