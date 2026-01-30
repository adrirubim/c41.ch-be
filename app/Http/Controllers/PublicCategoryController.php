<?php

namespace App\Http\Controllers;

use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicCategoryController extends Controller
{
    public function __construct(
        private CategoryRepository $categoryRepository,
        private PostRepository $postRepository
    ) {}

    /**
     * Display all categories for public view.
     */
    public function index(): Response
    {
        $categories = $this->categoryRepository->getAllWithPostCount(true)
            ->where('posts_count', '>', 0)
            ->sortByDesc('posts_count')
            ->values();

        return Inertia::render('public/categories', [
            'categories' => $categories,
        ]);
    }

    /**
     * Display posts by category for public view.
     */
    public function show(string $slug, Request $request): Response
    {
        $category = $this->categoryRepository->findBySlug($slug);

        if (! $category) {
            abort(404);
        }

        $filters = [
            'published' => true,
            'category' => $category->id,
            'search' => $request->get('search'),
            'sort_by' => $request->get('sort_by', 'published_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = $request->get('per_page', 12);
        $posts = $this->postRepository->getFiltered($filters, $perPage);
        $categories = $this->categoryRepository->getAll();

        return Inertia::render('public/category', [
            'category' => $category,
            'posts' => $posts,
            'categories' => $categories,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
        ]);
    }
}
