<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view the list
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Post $post): bool
    {
        return true; // Everyone can view individual posts
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create posts
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // Only the post author or an administrator can update it
        return $user->id === $post->user_id || $this->isAdmin($user);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // Only the post author or an administrator can delete it
        return $user->id === $post->user_id || $this->isAdmin($user);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Post $post): bool
    {
        // Only the post author or an administrator can restore it
        return $user->id === $post->user_id || $this->isAdmin($user);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        // Only administrators can permanently delete
        return $this->isAdmin($user);
    }

    /**
     * Check if user is admin
     */
    protected function isAdmin(User $user): bool
    {
        return $user->is_admin ?? false;
    }
}
