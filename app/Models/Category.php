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
    'image_base',
    'image_alt_text',
])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, HasModelAttributes, SoftDeletes;

    protected $appends = ['image_urls'];

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

    /**
     * @return array{thumb_webp: string, thumb_jpg: string, hero_webp: string, hero_jpg: string, original: string}|null
     */
    public function getImageUrlsAttribute(): ?array
    {
        if (! is_string($this->image_base) || $this->image_base === '') {
            return null;
        }

        $base = $this->image_base;
        $basePath = "media/categories/{$base}";

        return [
            'thumb_webp' => asset("storage/{$basePath}/thumb.webp"),
            'thumb_jpg' => asset("storage/{$basePath}/thumb.jpg"),
            'hero_webp' => asset("storage/{$basePath}/hero.webp"),
            'hero_jpg' => asset("storage/{$basePath}/hero.jpg"),
            'original' => asset("storage/{$basePath}/original"),
        ];
    }
}
