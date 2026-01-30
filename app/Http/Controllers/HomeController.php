<?php

namespace App\Http\Controllers;

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
        $featuredPostsPaginator = $this->postRepository->getFiltered([
            'published' => true,
            'featured' => true,
        ], 6);
        $featuredPosts = $featuredPostsPaginator->items();

        // Get recent posts
        $recentPostsPaginator = $this->postRepository->getFiltered([
            'published' => true,
        ], 6);
        $recentPosts = $recentPostsPaginator->items();

        // Get all categories with post counts (only published posts)
        $categories = $this->categoryRepository->getAllWithPostCount(true)
            ->where('posts_count', '>', 0)
            ->sortByDesc('posts_count')
            ->take(5)
            ->values();

        // Get statistics
        $stats = [
            'totalPosts' => \App\Models\Post::where('published', true)->count(),
            'totalCategories' => \App\Models\Category::count(),
            'totalViews' => \App\Models\Post::where('published', true)->sum('views_count'),
        ];

        return Inertia::render('public/home', [
            'featuredPosts' => $featuredPosts,
            'recentPosts' => $recentPosts,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }
}
