<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Repositories\PostRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PostRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_increment_views_debounced_only_increments_once_per_viewer_key_within_ttl(): void
    {
        // Arrange
        Cache::flush();

        $post = Post::factory()->create([
            'published' => true,
            'published_at' => now(),
            'views_count' => 0,
        ]);

        /** @var PostRepository $repo */
        $repo = app(PostRepository::class);

        // Act: same viewer key multiple times
        $repo->incrementViewsDebounced($post, 'viewer-1', 600);
        $repo->incrementViewsDebounced($post, 'viewer-1', 600);
        $repo->incrementViewsDebounced($post, 'viewer-1', 600);

        // Assert: only +1 in DB
        $post->refresh();
        $this->assertSame(1, (int) $post->views_count);

        // Act: different viewer key should increment again
        $repo->incrementViewsDebounced($post, 'viewer-2', 600);

        // Assert: +1 more
        $post->refresh();
        $this->assertSame(2, (int) $post->views_count);
    }
}

