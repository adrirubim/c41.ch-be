<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_blog_and_categories_are_accessible_without_auth(): void
    {
        // Arrange: no auth

        // Act
        $blogResponse = $this->get(route('public.posts.index'));
        $categoriesResponse = $this->get(route('public.categories.index'));

        // Assert
        $blogResponse->assertOk();
        $categoriesResponse->assertOk();
    }

    public function test_dashboard_routes_redirect_non_admin_users_to_public_blog(): void
    {
        // Arrange
        $user = User::factory()->create(['is_admin' => false]);
        $this->actingAs($user);

        // Act
        $dashboard = $this->get(route('dashboard'));
        $categoriesIndex = $this->get(route('categories.index'));

        // Assert
        $dashboard->assertRedirect(route('public.posts.index'));
        $categoriesIndex->assertRedirect(route('public.posts.index'));
    }

    public function test_dashboard_routes_redirect_guests_to_login(): void
    {
        // Arrange: guest

        // Act & Assert
        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->get(route('categories.index'))->assertRedirect(route('login'));
    }

    public function test_post_policy_allows_author_and_admin_to_update_and_denies_others(): void
    {
        // Arrange
        $author = User::factory()->create(['is_admin' => false]);
        $otherUser = User::factory()->create(['is_admin' => false]);
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'user_id' => $author->id,
            'published' => true,
        ]);

        // Act & Assert
        $this->assertTrue($author->can('update', $post));
        $this->assertFalse($otherUser->can('update', $post));
        $this->assertTrue($admin->can('update', $post));

        $this->assertFalse($author->can('assignAuthor', Post::class));
        $this->assertTrue($admin->can('assignAuthor', Post::class));
    }
}
