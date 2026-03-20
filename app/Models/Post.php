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
}
