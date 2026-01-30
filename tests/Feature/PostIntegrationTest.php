<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
    }

    public function test_user_can_create_post_with_categories(): void
    {
        $this->actingAs($this->user);

        $postData = [
            'title' => 'Test Post',
            'slug' => 'test-post',
            'content' => 'Test content',
            'excerpt' => 'Test excerpt',
            'published' => true,
            'categories' => [$this->category->id],
        ];

        $response = $this->post(route('posts.store'), $postData);

        $response->assertRedirect(route('posts.index'));
        $this->assertDatabaseHas('posts', ['title' => 'Test Post']);
        $this->assertDatabaseHas('category_post', [
            'category_id' => $this->category->id,
        ]);
    }

    public function test_user_can_update_post_and_categories(): void
    {
        $this->actingAs($this->user);

        $post = Post::factory()->create(['user_id' => $this->user->id]);
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        $post->categories()->attach([$category1->id]);

        $updateData = [
            'title' => 'Updated Post',
            'slug' => 'updated-post',
            'content' => 'Updated content',
            'excerpt' => 'Updated excerpt',
            'published' => true,
            'categories' => [$category2->id],
        ];

        $response = $this->put(route('posts.update', $post), $updateData);

        $response->assertRedirect(route('posts.index'));
        $this->assertDatabaseHas('posts', ['title' => 'Updated Post']);
        $this->assertDatabaseHas('category_post', [
            'post_id' => $post->id,
            'category_id' => $category2->id,
        ]);
        $this->assertDatabaseMissing('category_post', [
            'post_id' => $post->id,
            'category_id' => $category1->id,
        ]);
    }

    public function test_admin_can_delete_any_post(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($admin);

        $response = $this->delete(route('posts.destroy', $post));

        $response->assertRedirect(route('posts.index'));
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_user_cannot_delete_other_user_post(): void
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user);

        $response = $this->delete(route('posts.destroy', $post));

        $response->assertForbidden();
        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }
}
