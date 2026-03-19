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

    public function test_posts_index_search_works_with_like_fallback(): void
    {
        config([
            'services.search.hybrid_enabled' => true,
            'services.search.semantic_enabled' => true,
        ]);

        $this->actingAs($this->user);

        Post::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Laravel Search Baseline',
            'slug' => 'laravel-search-baseline',
            'content' => 'Testing fallback search behavior.',
        ]);

        Post::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Another Post',
            'slug' => 'another-post',
            'content' => 'Unrelated content',
        ]);

        $response = $this->get(route('posts.index', ['search' => 'Baseline']));

        $response->assertOk();
        $response->assertSee('Laravel Search Baseline');
        $response->assertDontSee('Another Post');
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

    public function test_guests_cannot_request_editorial_suggestions(): void
    {
        $response = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'A sample title',
            'content' => 'A sample content body',
        ]);

        $response->assertUnauthorized();
    }

    public function test_editorial_suggestions_return_service_unavailable_when_ai_is_disabled(): void
    {
        config(['services.ai.enabled' => false]);

        $adminUser = User::factory()->create(['is_admin' => true]);
        $this->actingAs($adminUser);

        $response = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'Laravel AI editorial helper',
            'content' => 'Generate concise summary and useful tags for this article.',
        ]);

        $response->assertStatus(503);
        $response->assertJsonPath('message', 'AI assistant is currently disabled.');
    }

    public function test_editorial_suggestions_return_excerpt_and_tags_when_ai_is_enabled(): void
    {
        config([
            'services.ai.enabled' => true,
            'services.ai.editorial_admin_only' => true,
        ]);

        $adminUser = User::factory()->create(['is_admin' => true]);
        $this->actingAs($adminUser);

        $response = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'Laravel AI editorial helper',
            'content' => 'This post explains editorial workflows for tag suggestions and excerpt generation in a CMS.',
            'tags' => ['CMS'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'message',
            'data' => [
                'excerpt',
                'tags',
            ],
        ]);
    }

    public function test_non_admin_users_cannot_request_editorial_suggestions_when_admin_only_is_enabled(): void
    {
        config([
            'services.ai.enabled' => true,
            'services.ai.editorial_admin_only' => true,
        ]);

        $this->actingAs($this->user);

        $response = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'Restricted editorial request',
            'content' => 'Only admin should be able to use this feature.',
        ]);

        $response->assertForbidden();
    }

    public function test_editorial_suggestions_are_rate_limited_with_dedicated_limiter(): void
    {
        config([
            'services.ai.enabled' => true,
            'services.ai.editorial_admin_only' => true,
            'services.ai.editorial_rate_limit_attempts' => 1,
        ]);

        $adminUser = User::factory()->create(['is_admin' => true]);
        $this->actingAs($adminUser);

        $first = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'First request',
            'content' => 'This should pass.',
        ]);
        $first->assertOk();

        $second = $this->postJson(route('posts.editorial-suggestions'), [
            'title' => 'Second request',
            'content' => 'This should be throttled.',
        ]);
        $second->assertTooManyRequests();
    }
}
