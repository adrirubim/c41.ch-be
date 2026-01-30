<?php

namespace App\Models;

use App\Services\HtmlPurifierService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
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
    ];

    protected $casts = [
        'published' => 'boolean',
        'published_at' => 'datetime',
        'tags' => 'array',
        'featured' => 'boolean',
    ];

    /**
     * Boot del modelo - sanitizar contenido HTML antes de guardar
     */
    protected static function booted(): void
    {
        static::saving(function ($post) {
            $purifier = app(HtmlPurifierService::class);

            // Sanitizar contenido si existe
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
     * Relación belongsTo con User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación many-to-many con Categories
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_post')
            ->withTimestamps();
    }
}
