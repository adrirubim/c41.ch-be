<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_guests_cannot_access_posts_index(): void
    {
        $this->get(route('posts.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_posts_index(): void
    {
        $this->actingAs($this->user);

        Post::factory()->count(5)->create();

        $response = $this->get(route('posts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('posts/index'));
    }

    public function test_authenticated_users_can_create_post(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();

        $response = $this->get(route('posts.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('posts/create'));
    }

    public function test_authenticated_users_can_store_post(): void
    {
        $this->actingAs($this->user);

        $category = Category::factory()->create();
        $postData = [
            'title' => 'Test Post',
            'slug' => 'test-post',
            'content' => 'Test content',
            'excerpt' => 'Test excerpt',
            'published' => false,
            'categories' => [$category->id],
        ];

        $response = $this->post(route('posts.store'), $postData);

        $response->assertRedirect(route('posts.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('posts', ['title' => 'Test Post']);
    }

    public function test_authenticated_users_can_view_post(): void
    {
        $this->actingAs($this->user);

        $post = Post::factory()->create(['user_id' => $this->user->id]);

        $response = $this->get(route('posts.show', $post));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('posts/show'));
    }

    public function test_users_can_only_update_their_own_posts(): void
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user);

        $response = $this->get(route('posts.edit', $post));

        $response->assertForbidden();
    }
}
