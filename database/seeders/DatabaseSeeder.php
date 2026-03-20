<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create administrator user (development only; set SEEDER_ADMIN_PASSWORD in .env or change after first login)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make(env('SEEDER_ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'is_admin' => true,
                // Ensure remember_token is set for realistic demo users.
                // (Not part of the model fillable; we will patch below.)
            ]
        );

        // Create test user
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make(env('SEEDER_TEST_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'is_admin' => false,
            ]
        );

        // Add realistic non-fillable fields.
        foreach (['admin@example.com', 'test@example.com'] as $email) {
            $user = User::query()->where('email', $email)->first();
            if ($user === null) {
                continue;
            }

            $user->forceFill([
                'remember_token' => $user->remember_token ?? Str::random(10),
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();
        }

        // Run seeders in order
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            PostSeeder::class,
        ]);
    }
}
