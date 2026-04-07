<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class InfrastructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_health_returns_ok_and_expected_json_shape(): void
    {
        // Arrange
        Cache::flush();

        // Act
        $response = $this->getJson('/api/health');

        // Assert
        $response->assertOk();
        $response->assertJsonStructure([
            'ok',
            'request_id',
            'checks' => [
                'db' => ['ok', 'error'],
                'cache' => ['ok', 'error'],
            ],
        ]);

        $this->assertTrue($response->json('ok'));
        $this->assertTrue($response->json('checks.db.ok'));
        $this->assertTrue($response->json('checks.cache.ok'));
    }

    public function test_sitemap_is_generated_with_routes_and_cached(): void
    {
        // Arrange
        Cache::flush();

        $category = Category::factory()->create(['slug' => 'testing-category']);
        $post = Post::factory()->create([
            'slug' => 'testing-post',
            'published' => true,
            'published_at' => now(),
        ]);
        $post->categories()->sync([$category->id]);

        $sitemapCacheKey = 'sitemap.xml.v1';

        // Act: first hit generates and caches
        $response1 = $this->get(route('sitemap'));

        // Assert
        $response1->assertOk();
        $response1->assertHeader('Content-Type', 'application/xml; charset=utf-8');
        $response1->assertSee('<urlset', false);
        $response1->assertSee(htmlspecialchars(route('home')), false);
        $response1->assertSee(htmlspecialchars(route('public.posts.show', ['slug' => $post->slug])), false);
        $response1->assertSee(htmlspecialchars(route('public.categories.show', ['slug' => $category->slug])), false);

        $this->assertTrue(Cache::has($sitemapCacheKey));

        // Act: second hit should serve cached value (key should still exist)
        $response2 = $this->get(route('sitemap'));

        // Assert
        $response2->assertOk();
        $this->assertTrue(Cache::has($sitemapCacheKey));
    }
}

