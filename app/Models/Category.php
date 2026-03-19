<?php

declare(strict_types=1);

namespace App\Models;

use App\Infrastructure\Eloquent\Attributes\Fillable;
use App\Infrastructure\Eloquent\Concerns\HasModelAttributes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder<Category>
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
     * @return BelongsToMany<Post, $this, \Illuminate\Database\Eloquent\Relations\Pivot, 'pivot'>
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'category_post')
            ->withTimestamps();
    }
}
