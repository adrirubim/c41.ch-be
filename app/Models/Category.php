<?php

declare(strict_types=1);

namespace App\Models;

use App\Infrastructure\Eloquent\Attributes\Fillable;
use App\Infrastructure\Eloquent\Concerns\HasModelAttributes;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin Builder<Category>
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'color',
])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, HasModelAttributes, SoftDeletes;

    /**
     * Many-to-many relationship with posts.
     */
    /**
     * @return BelongsToMany<Post, Category, Pivot, 'pivot'>
     */
    public function posts(): BelongsToMany
    {
        /** @var BelongsToMany<Post, Category, Pivot, 'pivot'> $relation */
        $relation = $this->belongsToMany(Post::class, 'category_post')
            ->withTimestamps();

        return $relation;
    }
}
