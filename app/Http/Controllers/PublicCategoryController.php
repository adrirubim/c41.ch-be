<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Post\DTO\PostFiltersData;
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
    ) {
        // Access control is enforced by route middleware.
    }

    /**
     * Display all categories for public view.
     */
    public function index(): Response
    {
        $categories = $this->categoryRepository->getAllWithPostCount(true)
            ->where('posts_count', '>', 0)
            ->sortByDesc('posts_count')
            ->values();

        $breadcrumbs = [
            ['name' => 'Home', 'item' => route('home')],
            ['name' => 'Categories', 'item' => route('public.categories.index')],
        ];

        $jsonLd = [
            [
                '@context' => 'https://schema.org',
                '@type' => 'BreadcrumbList',
                'itemListElement' => array_map(
                    static fn (array $b, int $i) => [
                        '@type' => 'ListItem',
                        'position' => $i + 1,
                        'name' => $b['name'],
                        'item' => $b['item'],
                    ],
                    $breadcrumbs,
                    array_keys($breadcrumbs),
                ),
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'CollectionPage',
                'name' => 'Categories',
                'url' => route('public.categories.index'),
            ],
        ];

        return Inertia::render('public/categories', [
            'categories' => $categories,
            'seo' => [
                'title' => 'Categories',
                'description' => 'Explora todas las categorías.',
                'canonicalUrl' => route('public.categories.index'),
                'jsonLd' => $jsonLd,
            ],
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

        $perPage = $request->get('per_page', 12);
        $postFilters = PostFiltersData::fromRequestData(
            filters: [
                'published' => true,
                'category' => $category->id,
                'search' => $request->get('search'),
                'sort_by' => $request->get('sort_by', 'published_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ],
            perPage: $perPage,
        );
        $posts = $this->postRepository->getFiltered($postFilters);
        $categories = $this->categoryRepository->getAll();

        $breadcrumbs = [
            ['name' => 'Home', 'item' => route('home')],
            ['name' => 'Categories', 'item' => route('public.categories.index')],
            ['name' => (string) $category->name, 'item' => route('public.categories.show', ['slug' => $category->slug])],
        ];

        $jsonLd = [
            [
                '@context' => 'https://schema.org',
                '@type' => 'BreadcrumbList',
                'itemListElement' => array_map(
                    static fn (array $b, int $i) => [
                        '@type' => 'ListItem',
                        'position' => $i + 1,
                        'name' => $b['name'],
                        'item' => $b['item'],
                    ],
                    $breadcrumbs,
                    array_keys($breadcrumbs),
                ),
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'CollectionPage',
                'name' => (string) $category->name,
                'url' => route('public.categories.show', ['slug' => $category->slug]),
            ],
        ];

        return Inertia::render('public/category', [
            'category' => $category,
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $postFilters->toViewArray(),
            'seo' => [
                'title' => (string) $category->name,
                'description' => (string) ($category->description ?: 'Artículos de esta categoría.'),
                'canonicalUrl' => route('public.categories.show', ['slug' => $category->slug]),
                'jsonLd' => $jsonLd,
            ],
        ]);
    }
}
