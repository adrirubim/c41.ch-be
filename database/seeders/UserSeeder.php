<?php

namespace Database\Seeders;

use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoEmailPrefix = 'C41-DEMO-';
        $count = (int) env('SEED_DEMO_USERS_COUNT', '10');

        $password = Hash::make(env('SEEDER_TEST_PASSWORD', 'password'));
        $faker = FakerFactory::create('en_US');

        // Idempotent creation: update existing users with same deterministic email.
        for ($i = 1; $i <= $count; $i++) {
            $email = $demoEmailPrefix.'user'.$i.'@example.com';

            $user = User::query()->where('email', $email)->first();
            if ($user === null) {
                $user = new User;
                $user->email = $email;
            }

            $user->forceFill([
                'name' => $faker->name(),
                'password' => $password,
                'email_verified_at' => now(),
                'is_admin' => false,
                'remember_token' => Str::random(10),
                // Demo: 2FA disabled by default (keep fields null/empty).
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]);

            $user->save();
        }
    }
}
