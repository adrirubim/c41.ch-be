<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Post\DTO\PostFiltersData;
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
        $posts = $this->postRepository->getPublicFilteredCached($postFilters);
        $categories = $this->categoryRepository->getAll();

        $breadcrumbs = [
            ['name' => 'Home', 'item' => route('home')],
            ['name' => 'Blog', 'item' => route('public.posts.index')],
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
                'name' => 'Blog',
                'url' => route('public.posts.index'),
            ],
        ];

        return Inertia::render('public/blog', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $postFilters->toViewArray(),
            'seo' => [
                'title' => 'Blog',
                'description' => 'Explora los artículos publicados.',
                'canonicalUrl' => route('public.posts.index'),
                'jsonLd' => $jsonLd,
            ],
        ]);
    }

    /**
     * Display a single published post for public view.
     */
    public function show(string $slug, Request $request): Response
    {
        $post = $this->postRepository->findPublishedBySlugCached($slug);

        // Debounced view increment to reduce write contention.
        $user = $request->user();
        $viewerKey = (string) (($user !== null ? $user->id : null) ?? $request->ip() ?? $request->session()->getId());
        $this->postRepository->incrementViewsDebounced($post, $viewerKey);

        $relatedPosts = $this->postRepository->getRelatedPublishedCached($post, 4);

        $breadcrumbs = [
            ['name' => 'Home', 'item' => route('home')],
            ['name' => 'Blog', 'item' => route('public.posts.index')],
            ['name' => $post->title, 'item' => route('public.posts.show', ['slug' => $post->slug])],
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
                '@type' => 'BlogPosting',
                'headline' => $post->title,
                'description' => $post->excerpt ?: $post->title,
                'author' => [
                    '@type' => 'Person',
                    'name' => $post->user?->name,
                ],
                'datePublished' => optional($post->published_at)->toAtomString(),
                'dateModified' => optional($post->updated_at)->toAtomString(),
                'mainEntityOfPage' => [
                    '@type' => 'WebPage',
                    '@id' => route('public.posts.show', ['slug' => $post->slug]),
                ],
                'url' => route('public.posts.show', ['slug' => $post->slug]),
            ],
        ];

        return Inertia::render('public/post', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'seo' => [
                'title' => $post->title,
                'description' => $post->excerpt ?: $post->title,
                'canonicalUrl' => route('public.posts.show', ['slug' => $post->slug]),
                'og' => [
                    'type' => 'article',
                    'title' => $post->title,
                    'description' => $post->excerpt ?: $post->title,
                    'url' => route('public.posts.show', ['slug' => $post->slug]),
                ],
                'twitter' => [
                    'card' => 'summary_large_image',
                    'title' => $post->title,
                    'description' => $post->excerpt ?: $post->title,
                ],
                'jsonLd' => $jsonLd,
            ],
        ]);
    }
}
