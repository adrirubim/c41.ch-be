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
            ['name' => 'Technology', 'slug' => 'technology', 'color' => '#3B82F6'],
            ['name' => 'Design', 'slug' => 'design', 'color' => '#EF4444'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'color' => '#10B981'],
            ['name' => 'Development', 'slug' => 'development', 'color' => '#F59E0B'],
            ['name' => 'Business', 'slug' => 'business', 'color' => '#8B5CF6'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'color' => $category['color'],
                ]
            );
        }
    }
}
