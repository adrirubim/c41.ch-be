<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $this->actingAs($user = User::factory()->create());

        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('dashboard'));
    }

    public function test_dashboard_displays_correct_statistics(): void
    {
        $this->actingAs($user = User::factory()->create());

        Post::factory()->count(10)->create(['published' => true]);
        Post::factory()->count(5)->create(['published' => false]);
        Category::factory()->count(3)->create();

        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('stats')
            ->has('recentPosts')
            ->has('popularPosts')
            ->has('categoriesDistribution')
        );
    }
}
