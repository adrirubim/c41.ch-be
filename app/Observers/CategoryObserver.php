<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Category;
use App\Repositories\PostRepository;
use Illuminate\Support\Facades\Cache;

class CategoryObserver
{
    public function __construct(
        private readonly PostRepository $posts
    ) {
    }

    public function created(Category $category): void
    {
        $this->invalidateAfterMutation();
    }

    public function updated(Category $category): void
    {
        $this->invalidateAfterMutation();
    }

    public function deleted(Category $category): void
    {
        $this->invalidateAfterMutation();
    }

    public function restored(Category $category): void
    {
        $this->invalidateAfterMutation();
    }

    public function forceDeleted(Category $category): void
    {
        $this->invalidateAfterMutation();
    }

    private function invalidateAfterMutation(): void
    {
        // Category list caches (used in admin + public pages).
        Cache::forget('categories.list');
        Cache::forget('categories.with_post_count');

        // Category mutations can change public category pages, post filtering, and sitemap category URLs.
        $this->posts->invalidatePublicIndexCache();
        $this->posts->invalidatePublicRelatedCache();
        $this->posts->invalidateSitemapCache();
    }
}

<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Category;
use App\Repositories\PostRepository;

class CategoryObserver
{
    public function __construct(
        private PostRepository $postRepository
    ) {}

    public function saved(Category $category): void
    {
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }

    public function deleted(Category $category): void
    {
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }

    public function restored(Category $category): void
    {
        $this->postRepository->invalidatePublicRelatedCache();
        $this->postRepository->invalidateSitemapCache();
    }
}

