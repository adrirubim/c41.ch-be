<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'color' => '#3B82F6',
                'description' => 'Practical insights on software engineering, systems, and modern engineering workflows.',
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'color' => '#EF4444',
                'description' => 'Patterns for building usable interfaces and creating consistent product experiences.',
            ],
            [
                'name' => 'Marketing',
                'slug' => 'marketing',
                'color' => '#10B981',
                'description' => 'Strategies for growth, storytelling, and shipping content that converts.',
            ],
            [
                'name' => 'Development',
                'slug' => 'development',
                'color' => '#F59E0B',
                'description' => 'Deep dives into architecture, performance, and developer experience.',
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'color' => '#8B5CF6',
                'description' => 'How teams make decisions: product trade-offs, metrics, and sustainable operations.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'color' => $category['color'],
                    'description' => $category['description'],
                ]
            );
        }
    }
}
