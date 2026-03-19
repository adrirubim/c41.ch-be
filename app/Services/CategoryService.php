<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Category\DTO\CategoryUpsertData;
use App\Events\CategoryCreated;
use App\Events\CategoryDeleted;
use App\Events\CategoryUpdated;
use App\Models\Category;
use App\Repositories\CategoryRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function __construct(
        private CategoryRepository $repository
    ) {}

    /**
     * Get all categories
     *
     * @return Collection<int, Category>
     */
    public function getAll(): Collection
    {
        return Cache::flexible('categories.list', [300, 600], function () {
            return $this->repository->getAll();
        });
    }

    /**
     * Get categories with post count
     *
     * @return Collection<int, Category>
     */
    public function getAllWithPostCount(): Collection
    {
        /** @var Collection<int, Category> $categories */
        $categories = Cache::flexible('categories.with_post_count', [300, 600], function (): Collection {
            return $this->repository->getAllWithPostCount();
        });

        return $categories;
    }

    /**
     * Create a new category
     */
    public function create(CategoryUpsertData $data): Category
    {
        $category = $this->repository->create($data);

        // Trigger event
        event(new CategoryCreated($category));

        // Clear cache
        $this->clearCache();

        return $category;
    }

    /**
     * Update a category
     */
    public function update(Category $category, CategoryUpsertData $data): bool
    {
        $updated = $this->repository->update($category, $data);

        // Trigger event
        if ($updated) {
            $category->refresh();
            event(new CategoryUpdated($category));
            $this->clearCache();
        }

        return $updated;
    }

    /**
     * Delete a category
     */
    public function delete(Category $category): bool
    {
        $deleted = $this->repository->delete($category);

        // Trigger event
        if ($deleted) {
            event(new CategoryDeleted($category));
            $this->clearCache();
        }

        return $deleted;
    }

    /**
     * Get a category by ID
     */
    public function findById(int $id): ?Category
    {
        return $this->repository->findById($id);
    }

    /**
     * Get a category by slug
     */
    public function findBySlug(string $slug): ?Category
    {
        return $this->repository->findBySlug($slug);
    }

    /**
     * Clear cache entries related to categories.
     */
    private function clearCache(): void
    {
        Cache::forget('categories.list');
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.categories_distribution');
    }
}
