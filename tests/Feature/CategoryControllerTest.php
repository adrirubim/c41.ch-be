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
        $this->user = User::factory()->create();
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

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('categories/index'));
    }

    public function test_authenticated_users_can_create_category(): void
    {
        $this->actingAs($this->user);

        $response = $this->get(route('categories.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('categories/create'));
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

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categories', ['name' => 'Test Category']);
    }

    public function test_authenticated_users_can_update_category(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();

        $response = $this->get(route('categories.edit', $category));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('categories/edit'));
    }

    public function test_authenticated_users_can_delete_category(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();

        $response = $this->delete(route('categories.destroy', $category));

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }
}
