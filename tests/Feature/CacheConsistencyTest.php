<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Repositories\PostRepository;
use Illuminate\Cache\TaggableStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CacheConsistencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_cached_public_post_is_invalidated_when_post_changes(): void
    {
        // Arrange
        Cache::flush();

        $post = Post::factory()->create([
            'slug' => 'cache-consistency-post',
            'published' => true,
            'published_at' => now(),
            'views_count' => 0,
        ]);

        /** @var PostRepository $repo */
        $repo = app(PostRepository::class);
        $cacheKey = 'public.posts.show.'.md5($post->slug);
        $hasCacheKey = function () use ($cacheKey): bool {
            if (Cache::getStore() instanceof TaggableStore) {
                return Cache::tags(['public_posts_show'])->has($cacheKey);
            }

            return Cache::has($cacheKey);
        };

        // Act (1): prime cache
        $cachedPost = $repo->findPublishedBySlugCached($post->slug);

        // Assert (1): cache present and value matches
        $this->assertSame($post->slug, $cachedPost->slug);
        $this->assertTrue($hasCacheKey());

        // Act (2): update post (triggers Observer invalidation)
        $post->title = 'Updated Title';
        $post->save();

        // Assert (2): cache key should have been cleared by observer
        $this->assertFalse($hasCacheKey());

        // Act (3): fetch again (recaches)
        $fresh = $repo->findPublishedBySlugCached($post->slug);

        // Assert (3): new data visible
        $this->assertSame('Updated Title', $fresh->title);
        $this->assertTrue($hasCacheKey());
    }
}
