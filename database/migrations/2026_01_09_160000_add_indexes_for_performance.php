<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Indexes for common filters
            $table->index('published', 'posts_published_index');
            $table->index('featured', 'posts_featured_index');
            $table->index('views_count', 'posts_views_count_index');
            $table->index('user_id', 'posts_user_id_index');
            $table->index('created_at', 'posts_created_at_index');
            $table->index('published_at', 'posts_published_at_index');

            // Composite indexes for frequent queries
            $table->index(['published', 'published_at'], 'posts_published_published_at_index');
            $table->index(['published', 'featured'], 'posts_published_featured_index');
            $table->index(['published', 'created_at'], 'posts_published_created_at_index');

            // Index for slug searches (an additional index for LIKE queries,
            // even though the unique constraint already creates one)
        });

        Schema::table('categories', function (Blueprint $table) {
            // Indexes for search and ordering
            $table->index('name', 'categories_name_index');
            $table->index('slug', 'categories_slug_index');
            $table->index('created_at', 'categories_created_at_index');
        });

        // Index on the pivot table for relations
        Schema::table('category_post', function (Blueprint $table) {
            $table->index('category_id', 'category_post_category_id_index');
            $table->index('post_id', 'category_post_post_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_published_index');
            $table->dropIndex('posts_featured_index');
            $table->dropIndex('posts_views_count_index');
            $table->dropIndex('posts_user_id_index');
            $table->dropIndex('posts_created_at_index');
            $table->dropIndex('posts_published_at_index');
            $table->dropIndex('posts_published_published_at_index');
            $table->dropIndex('posts_published_featured_index');
            $table->dropIndex('posts_published_created_at_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_name_index');
            $table->dropIndex('categories_slug_index');
            $table->dropIndex('categories_created_at_index');
        });

        Schema::table('category_post', function (Blueprint $table) {
            $table->dropIndex('category_post_category_id_index');
            $table->dropIndex('category_post_post_id_index');
        });
    }
};
