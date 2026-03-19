<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::query()->get();
        if ($categories->isEmpty()) {
            $this->call(CategorySeeder::class);
            $categories = Category::query()->get();
        }

        $userId = User::query()->value('id') ?? User::factory()->create()->id;

        // Keep seeding fast and reliable across DBs (SQLite/Postgres):
        // avoid expensive model events and avoid relying on Faker uniqueness.
        $posts = Post::withoutEvents(function () use ($userId) {
            $created = collect();

            for ($i = 1; $i <= 20; $i++) {
                $title = "Seeded Post {$i}";
                $isPublished = $i <= 15; // 75% published

                $created->push(Post::query()->create([
                    'title' => $title,
                    'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
                    'content' => "<p>Seeded content for post {$i}.</p>",
                    'excerpt' => "Seeded excerpt for post {$i}.",
                    'published' => $isPublished,
                    'published_at' => $isPublished ? now()->subDays(21 - $i) : null,
                    'user_id' => $userId,
                    'tags' => ['seed', 'demo', "post-{$i}"],
                    'views_count' => $isPublished ? ($i * 50) : 0,
                    'featured' => $isPublished && $i <= 3,
                ]));
            }

            return $created;
        });

        // Assign 1-3 random categories to each post
        foreach ($posts as $post) {
            $take = min($categories->count(), rand(1, 3));
            /** @var Collection<int, Category> $randomCategories */
            $randomCategories = $categories->random($take);
            $post->categories()->syncWithoutDetaching($randomCategories->pluck('id')->all());
        }
    }
}
