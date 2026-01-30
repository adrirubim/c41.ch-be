<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
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

        $name = $faker->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $faker->optional()->sentence(),
            'color' => $faker->hexColor(),
        ];
    }
}
