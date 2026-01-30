<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
    ];

    /**
     * Relación many-to-many con Posts
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'category_post')
            ->withTimestamps();
    }
}
