<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Repositories\CategoryRepository;
use App\Services\PostService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private PostService $postService,
        private CategoryRepository $categoryRepository
    ) {}

    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        // Cache statistics (5 minutes)
        $stats = Cache::remember('dashboard.stats', 300, function () {
            $postsCount = Post::withoutTrashed()->count();
            $publishedPostsCount = Post::withoutTrashed()->where('published', true)->count();
            $featuredPostsCount = Post::withoutTrashed()->where('featured', true)->count();
            $categoriesCount = Category::withoutTrashed()->count();
            $totalViews = Post::withoutTrashed()->sum('views_count');
            $usersCount = User::count();
            $averageViews = $postsCount > 0 ? round($totalViews / $postsCount, 0) : 0;
            $postsThisMonth = Post::withoutTrashed()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            return [
                'totalPosts' => $postsCount,
                'publishedPosts' => $publishedPostsCount,
                'featuredPosts' => $featuredPostsCount,
                'categories' => $categoriesCount,
                'totalViews' => $totalViews,
                'usersCount' => $usersCount,
                'averageViews' => $averageViews,
                'postsThisMonth' => $postsThisMonth,
            ];
        });

        // Cache recent posts (2 minutes)
        $recentPosts = Cache::remember('dashboard.recent_posts', 120, function () {
            return $this->postService->getRecent(5);
        });

        // Cache popular posts (2 minutes)
        $popularPosts = Cache::remember('dashboard.popular_posts', 120, function () {
            return $this->postService->getPopular(5);
        });

        // Cache category distribution (5 minutes)
        $categoriesDistribution = Cache::remember('dashboard.categories_distribution', 300, function () {
            $categories = $this->categoryRepository->getAllWithPostCount()
                ->sortByDesc('posts_count')
                ->values();

            return $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'color' => $category->color,
                    'posts_count' => (int) ($category->posts_count ?? 0),
                ];
            });
        });

        // Last published post (no cache to always show the most recent)
        $lastPublishedPost = Post::withoutTrashed()
            ->with(['user:id,name,email', 'categories:id,name,slug,color'])
            ->select('id', 'title', 'slug', 'published', 'featured', 'views_count', 'published_at', 'created_at', 'user_id')
            ->where('published', true)
            ->latest('published_at')
            ->first();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentPosts' => $recentPosts,
            'popularPosts' => $popularPosts,
            'categoriesDistribution' => $categoriesDistribution,
            'lastPublishedPost' => $lastPublishedPost,
        ]);
    }
}
