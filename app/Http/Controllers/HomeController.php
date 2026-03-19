<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Post\DTO\PostFiltersData;
use App\Models\Category;
use App\Models\Post;
use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private PostRepository $postRepository,
        private CategoryRepository $categoryRepository
    ) {}

    /**
     * Display the public homepage.
     */
    public function index(): Response
    {
        // Get featured posts
        $featuredFilters = PostFiltersData::fromRequestData(
            filters: [
                'published' => true,
                'featured' => true,
            ],
            perPage: 6,
        );
        $featuredPostsPaginator = $this->postRepository->getFiltered($featuredFilters);
        $featuredPosts = $featuredPostsPaginator->items();

        // Get recent posts
        $recentFilters = PostFiltersData::fromRequestData(
            filters: [
                'published' => true,
            ],
            perPage: 6,
        );
        $recentPostsPaginator = $this->postRepository->getFiltered($recentFilters);
        $recentPosts = $recentPostsPaginator->items();

        // Get all categories with post counts (only published posts)
        $categories = $this->categoryRepository->getAllWithPostCount(true)
            ->where('posts_count', '>', 0)
            ->sortByDesc('posts_count')
            ->take(5)
            ->values();

        // Get statistics
        $stats = [
            'totalPosts' => Post::where('published', true)->count(),
            'totalCategories' => Category::count(),
            'totalViews' => Post::where('published', true)->sum('views_count'),
        ];

        return Inertia::render('public/home', [
            'featuredPosts' => $featuredPosts,
            'recentPosts' => $recentPosts,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }
}
