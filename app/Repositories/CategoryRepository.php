<?php

namespace App\Repositories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository
{
    /**
     * Get all categories without deleted
     */
    public function getAll(): Collection
    {
        return Category::withoutTrashed()->get();
    }

    /**
     * Get categories with post count
     */
    public function getAllWithPostCount(bool $publishedOnly = false): Collection
    {
        $query = Category::withoutTrashed()
            ->withCount(['posts' => function ($query) use ($publishedOnly) {
                $query->withoutTrashed();
                if ($publishedOnly) {
                    $query->where('published', true);
                }
            }]);

        return $query->get();
    }

    /**
     * Get a category by ID
     */
    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }

    /**
     * Get a category by slug
     */
    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }

    /**
     * Create a new category
     */
    public function create(array $data): Category
    {
        return Category::create($data);
    }

    /**
     * Update a category
     */
    public function update(Category $category, array $data): bool
    {
        return $category->update($data);
    }

    /**
     * Delete a category (soft delete)
     */
    public function delete(Category $category): bool
    {
        return $category->delete();
    }
}
