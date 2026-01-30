<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create administrator user (development only; set SEEDER_ADMIN_PASSWORD in .env or change after first login)
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make(env('SEEDER_ADMIN_PASSWORD', 'password')),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        // Create test user
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make(env('SEEDER_TEST_PASSWORD', 'password')),
            'email_verified_at' => now(),
        ]);

        // Ejecutar seeders en orden
        $this->call([
            CategorySeeder::class,
            PostSeeder::class,
        ]);
    }
}
