<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Infrastructure\Eloquent\Attributes\Cast;
use App\Infrastructure\Eloquent\Attributes\Fillable;
use App\Infrastructure\Eloquent\Concerns\HasModelAttributes;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'email',
    'password',
    'is_admin',
])]
#[Cast([
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'two_factor_confirmed_at' => 'datetime',
    'is_admin' => 'boolean',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasModelAttributes, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * HasMany relationship with posts.
     */
    /**
     * @return HasMany<Post, User>
     */
    public function posts(): HasMany
    {
        /** @var HasMany<Post, User> $relation */
        $relation = $this->hasMany(Post::class);

        return $relation;
    }
}
