<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Domain\Category\DTO\CategoryUpsertData;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository
{
    /**
     * Get all categories without deleted
     *
     * @return Collection<int, Category>
     */
    public function getAll(): Collection
    {
        return Category::withoutTrashed()->get();
    }

    /**
     * Get categories with post count
     *
     * @return Collection<int, Category>
     */
    public function getAllWithPostCount(bool $publishedOnly = false): Collection
    {
        /** @var Builder<Category> $query */
        $query = Category::withoutTrashed()
            ->withCount(['posts' => function (Builder $query) use ($publishedOnly): void {
                /** @var Builder<Post> $query */
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
    public function create(CategoryUpsertData $data): Category
    {
        return Category::create($data->toPersistenceArray());
    }

    /**
     * Update a category
     */
    public function update(Category $category, CategoryUpsertData $data): bool
    {
        return $category->update($data->toPersistenceArray());
    }

    /**
     * Delete a category (soft delete)
     */
    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }
}
