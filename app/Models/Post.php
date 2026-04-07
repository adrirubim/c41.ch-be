<?php

declare(strict_types=1);

namespace App\Models;

use App\Infrastructure\Eloquent\Attributes\Cast;
use App\Infrastructure\Eloquent\Attributes\Fillable;
use App\Infrastructure\Eloquent\Concerns\HasModelAttributes;
use App\Services\HtmlPurifierService;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin Builder<Post>
 */
#[Fillable([
    'title',
    'slug',
    'content',
    'excerpt',
    'published',
    'published_at',
    'user_id',
    'category',
    'tags',
    'views_count',
    'featured',
    'hero_image_base',
    'hero_image_alt_text',
])]
#[Cast([
    'published' => 'boolean',
    'published_at' => 'datetime',
    'tags' => 'array',
    'featured' => 'boolean',
])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory, HasModelAttributes, SoftDeletes;

    protected $appends = ['hero_image_urls'];

    protected static function booted(): void
    {
        static::saving(function (self $post): void {
            $purifier = app(HtmlPurifierService::class);

            // Sanitize content when present.
            if (! empty($post->content)) {
                $post->content = $purifier->purify($post->content);
            }

            // Also sanitize excerpt if it contains HTML
            if (! empty($post->excerpt)) {
                $post->excerpt = $purifier->purify($post->excerpt);
            }
        });
    }

    /**
     * @return BelongsTo<User, Post>
     */
    public function user(): BelongsTo
    {
        /** @var BelongsTo<User, Post> $relation */
        $relation = $this->belongsTo(User::class);

        return $relation;
    }

    /**
     * @return BelongsToMany<Category, Post, Pivot, 'pivot'>
     */
    public function categories(): BelongsToMany
    {
        /** @var BelongsToMany<Category, Post, Pivot, 'pivot'> $relation */
        $relation = $this->belongsToMany(Category::class, 'category_post')
            ->withTimestamps();

        return $relation;
    }

    /**
     * @return array{thumb_webp: string, thumb_jpg: string, hero_webp: string, hero_jpg: string, original: string}|null
     */
    public function getHeroImageUrlsAttribute(): ?array
    {
        if (! is_string($this->hero_image_base) || $this->hero_image_base === '') {
            return null;
        }

        $base = $this->hero_image_base;
        $basePath = "media/posts/{$base}";

        return [
            'thumb_webp' => asset("storage/{$basePath}/thumb.webp"),
            'thumb_jpg' => asset("storage/{$basePath}/thumb.jpg"),
            'hero_webp' => asset("storage/{$basePath}/hero.webp"),
            'hero_jpg' => asset("storage/{$basePath}/hero.jpg"),
            'original' => asset("storage/{$basePath}/original"),
        ];
    }
}
