<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view categories
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Category $category): bool
    {
        return true; // Everyone can view individual categories
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Por ahora, todos pueden crear categorías
        // En el futuro, puedes restringir a administradores
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Category $category): bool
    {
        // Por ahora, todos pueden actualizar categorías
        // En el futuro, puedes restringir a administradores
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Category $category): bool
    {
        // Check if category has associated posts
        // If it has posts, only administrators can delete it
        $hasPosts = $category->posts()->withoutTrashed()->exists();

        if ($hasPosts) {
            return $this->isAdmin($user);
        }

        // If it has no posts, everyone can delete it
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Category $category): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Category $category): bool
    {
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
