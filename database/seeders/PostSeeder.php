<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 20 posts using the factory
        $posts = Post::factory(20)->create();

        // Get all categories
        $categories = Category::all();

        // Assign 1-3 random categories to each post
        foreach ($posts as $post) {
            $randomCategories = $categories->random(rand(1, 3));
            $post->categories()->attach($randomCategories->pluck('id')->toArray());
        }
    }
}
