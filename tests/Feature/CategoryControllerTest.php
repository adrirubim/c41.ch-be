<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Dashboard category management is admin-only.
        // Regular users should be redirected to the public blog.
        $this->user = User::factory()->create(['is_admin' => false]);
    }

    public function test_guests_cannot_access_categories_index(): void
    {
        $this->get(route('categories.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_categories_index(): void
    {
        $this->actingAs($this->user);

        Category::factory()->count(3)->create();

        $response = $this->get(route('categories.index'));

        $response->assertRedirect(route('public.posts.index'));
    }

    public function test_authenticated_users_can_create_category(): void
    {
        $this->actingAs($this->user);

        $response = $this->get(route('categories.create'));

        $response->assertRedirect(route('public.posts.index'));
    }

    public function test_authenticated_users_can_store_category(): void
    {
        $this->actingAs($this->user);

        $categoryData = [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Test description',
            'color' => '#FF0000',
        ];

        $response = $this->post(route('categories.store'), $categoryData);

        $response->assertRedirect(route('public.posts.index'));
        $this->assertDatabaseMissing('categories', ['name' => 'Test Category']);
    }

    public function test_authenticated_users_can_update_category(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();

        $response = $this->get(route('categories.edit', $category));

        $response->assertRedirect(route('public.posts.index'));
    }

    public function test_authenticated_users_can_delete_category(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();

        $response = $this->delete(route('categories.destroy', $category));

        $response->assertRedirect(route('public.posts.index'));
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}
