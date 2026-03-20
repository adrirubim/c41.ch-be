<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Post\DTO\PostFiltersData;
use App\Models\Post;
use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController extends Controller
{
    public function __construct(
        private PostRepository $postRepository,
        private CategoryRepository $categoryRepository
    ) {
        // Access control is enforced by route middleware.
    }

    /**
     * Display a listing of published posts for public view.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $postFilters = PostFiltersData::fromRequestData(
            filters: [
                'published' => true,
                'search' => $request->get('search'),
                'category' => $request->get('category'),
                'featured' => $request->get('featured'),
                'sort_by' => $request->get('sort_by', 'published_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ],
            perPage: $perPage,
        );
        $posts = $this->postRepository->getFiltered($postFilters);
        $categories = $this->categoryRepository->getAll();

        return Inertia::render('public/blog', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $postFilters->toViewArray(),
        ]);
    }

    /**
     * Display a single published post for public view.
     */
    public function show(string $slug): Response
    {
        $post = Post::where('slug', $slug)
            ->where('published', true)
            ->with(['user', 'categories'])
            ->firstOrFail();

        // Increment views count
        $post->increment('views_count');

        // Get related posts (same categories)
        $relatedPosts = Post::where('published', true)
            ->where('id', '!=', $post->id)
            ->whereHas('categories', function ($query) use ($post) {
                $query->whereIn('categories.id', $post->categories->pluck('id'));
            })
            ->with(['user', 'categories'])
            ->limit(4)
            ->get();

        return Inertia::render('public/post', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
