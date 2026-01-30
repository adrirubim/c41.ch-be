<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Force English locale for Faker to ensure English content
        // This overrides any system locale settings
        $faker = \Faker\Factory::create('en_US');

        // Generate realistic English content
        $title = $faker->realText(60); // Generate realistic English title (max 60 chars)
        $excerpt = $faker->realText(150); // Generate realistic English excerpt (max 150 chars)
        $content = $faker->realText(2000); // Generate realistic English content (max 2000 chars)

        // Professional distribution: 75% published, 25% drafts
        $isPublished = $faker->boolean(75);

        // Format content as HTML paragraphs
        $formattedContent = '<p>'.str_replace("\n", '</p><p>', $content).'</p>';

        return [
            'title' => rtrim($title, '.').'.', // Ensure title ends with period
            'slug' => Str::slug($title),
            'content' => $formattedContent,
            'excerpt' => $excerpt,
            'published' => $isPublished,
            // Published posts should have published_at date, drafts should be null
            'published_at' => $isPublished
                ? $faker->dateTimeBetween('-1 year', 'now')
                : null,
            'user_id' => User::factory(),
            // Note: Categories are assigned via many-to-many relationship in PostSeeder
            'tags' => $faker->words(3),
            // More realistic view counts: published posts get more views
            'views_count' => $isPublished
                ? $faker->numberBetween(50, 5000)
                : $faker->numberBetween(0, 100),
            // Featured posts are more likely to be published (25% of published posts)
            'featured' => $isPublished && $faker->boolean(25),
        ];
    }
}
