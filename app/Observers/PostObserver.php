<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Post;
use App\Repositories\PostRepository;

class PostObserver
{
    public function __construct(
        private readonly PostRepository $posts
    ) {
    }

    public function created(Post $post): void
    {
        $this->invalidateAfterMutation($post, originalSlug: null);
    }

    public function updated(Post $post): void
    {
        $originalSlug = $post->getOriginal('slug');

        $this->invalidateAfterMutation(
            $post,
            originalSlug: is_string($originalSlug) && $originalSlug !== '' ? $originalSlug : null
        );
    }

    public function deleted(Post $post): void
    {
        $this->invalidateAfterMutation($post, originalSlug: null);
    }

    public function restored(Post $post): void
    {
        $this->invalidateAfterMutation($post, originalSlug: null);
    }

    public function forceDeleted(Post $post): void
    {
        $this->invalidateAfterMutation($post, originalSlug: null);
    }

    private function invalidateAfterMutation(Post $post, ?string $originalSlug): void
    {
        // Public index and related lists depend on published state, category membership, and ordering.
        $this->posts->invalidatePublicIndexCache();
        $this->posts->invalidatePublicRelatedCache();

        // Sitemap includes both posts and categories; any post publication/slug/timestamps can change it.
        $this->posts->invalidateSitemapCache();

        // Invalidate show cache for current slug and, when relevant, the previous slug.
        if (is_string($post->slug) && $post->slug !== '') {
            $this->posts->invalidatePublicShowCacheForSlug($post->slug);
        }

        if ($originalSlug !== null && $originalSlug !== $post->slug) {
            $this->posts->invalidatePublicShowCacheForSlug($originalSlug);
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Post;
use App\Repositories\PostRepository;

class PostObserver
{
    public function __construct(
        private PostRepository $postRepository
    ) {}

    public function saved(Post $post): void
    {
        $oldSlug = (string) ($post->getOriginal('slug') ?? '');
        $newSlug = (string) ($post->slug ?? '');

        if ($oldSlug !== '' && $oldSlug !== $newSlug) {
            $this->postRepository->invalidatePublicShowCacheForSlug($oldSlug);
        }

        if ($newSlug !== '') {
            $this->postRepository->invalidatePublicShowCacheForSlug($newSlug);
        }

        $this->postRepository->invalidatePublicIndexCache();
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }

    public function deleted(Post $post): void
    {
        $slug = (string) ($post->slug ?? $post->getOriginal('slug') ?? '');
        if ($slug !== '') {
            $this->postRepository->invalidatePublicShowCacheForSlug($slug);
        }

        $this->postRepository->invalidatePublicIndexCache();
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }

    public function restored(Post $post): void
    {
        $slug = (string) ($post->slug ?? '');
        if ($slug !== '') {
            $this->postRepository->invalidatePublicShowCacheForSlug($slug);
        }

        $this->postRepository->invalidatePublicIndexCache();
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }
}

