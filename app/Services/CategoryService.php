<?php

namespace App\Services;

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
     */
    public function getAll(): Collection
    {
        return Cache::remember('categories.list', 600, function () {
            return $this->repository->getAll();
        });
    }

    /**
     * Get categories with post count
     */
    public function getAllWithPostCount(): Collection
    {
        return $this->repository->getAllWithPostCount();
    }

    /**
     * Create a new category
     */
    public function create(array $data): Category
    {
        $category = $this->repository->create($data);

        // Trigger event
        event(new \App\Events\CategoryCreated($category));

        // Clear cache
        $this->clearCache();

        return $category;
    }

    /**
     * Update a category
     */
    public function update(Category $category, array $data): bool
    {
        $updated = $this->repository->update($category, $data);

        // Trigger event
        if ($updated) {
            event(new \App\Events\CategoryUpdated($category->fresh()));
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
            event(new \App\Events\CategoryDeleted($category));
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
     * Limpiar caché relacionado con categorías
     */
    private function clearCache(): void
    {
        Cache::forget('categories.list');
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.categories_distribution');
    }
}
