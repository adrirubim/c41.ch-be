<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Post\DTO\PostEditorialSuggestionInputData;
use App\Domain\Post\DTO\PostFiltersData;
use App\Domain\Post\DTO\PostUpsertData;
use App\Http\Requests\PostEditorialSuggestionRequest;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use App\Models\User;
use App\Services\CategoryService;
use App\Services\PostEditorialSuggestionService;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PostController extends Controller
{
    public function __construct(
        private PostService $postService,
        private CategoryService $categoryService,
        private PostEditorialSuggestionService $editorialSuggestionService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $postFilters = PostFiltersData::fromRequestData(
            $request->only(['search', 'category', 'published', 'featured', 'sort_by', 'sort_order']),
            $request->input('per_page', 15)
        );

        $posts = $this->postService->getFiltered($postFilters);
        $categories = $this->categoryService->getAll();

        return Inertia::render('posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $postFilters->toViewArray(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        if ($user === null) {
            abort(401);
        }

        $categories = $this->categoryService->getAll();
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('posts/create', [
            'categories' => $categories,
            'users' => $users,
            'defaultUserId' => $user->id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $user = $request->user();
        if ($user === null) {
            abort(401);
        }

        $validated = $request->validated();
        // If author is being overridden, require explicit authorization.
        if (array_key_exists('user_id', $validated) && (int) $validated['user_id'] !== (int) $user->id) {
            $this->authorize('assignAuthor', Post::class);
        }
        $postData = PostUpsertData::fromValidated(
            validated: $validated,
            defaultUserId: $user->id,
            clearPublishedAtWhenUnpublished: false,
        );

        /** @var array<int, int>|null $categoryIds */
        $categoryIds = $request->has('categories') ? $request->input('categories') : null;
        $this->postService->create($postData, $categoryIds);

        return redirect()->route('posts.index')
            ->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post): Response
    {
        $post->load(['user', 'categories']);

        return Inertia::render('posts/show', [
            'post' => $post,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post, Request $request): Response
    {
        $this->authorize('update', $post);

        $user = $request->user();
        if ($user === null) {
            abort(401);
        }

        $post->load('categories');
        $categories = $this->categoryService->getAll();
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('posts/edit', [
            'post' => $post,
            'categories' => $categories,
            'users' => $users,
            'defaultUserId' => $user->id,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);

        $user = $request->user();
        if ($user === null) {
            abort(401);
        }

        $validated = $request->validated();
        // If author is being overridden, require explicit authorization.
        if (array_key_exists('user_id', $validated) && (int) $validated['user_id'] !== (int) $user->id) {
            $this->authorize('assignAuthor', Post::class);
        }
        $postData = PostUpsertData::fromValidated(
            validated: $validated,
            defaultUserId: $user->id,
            clearPublishedAtWhenUnpublished: true,
        );

        /** @var array<int, int> $categoryIds */
        $categoryIds = $request->has('categories') ? $request->input('categories', []) : [];
        $this->postService->update($post, $postData, $categoryIds);

        return redirect()->route('posts.index')
            ->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        $this->postService->delete($post);

        return redirect()->route('posts.index')
            ->with('success', 'Post deleted successfully.');
    }

    public function editorialSuggestions(
        PostEditorialSuggestionRequest $request
    ): JsonResponse {
        $startedAt = microtime(true);
        $user = $request->user();
        $this->authorize('useEditorialSuggestions', Post::class);

        if (! config('services.ai.enabled', false)) {
            Log::info('ai_editorial_suggestions_disabled', [
                'user_id' => $user?->id,
                'request_id' => app()->bound('request_id') ? app('request_id') : null,
            ]);

            return response()->json([
                'message' => 'AI assistant is currently disabled.',
            ], 503);
        }

        $input = PostEditorialSuggestionInputData::fromValidated($request->validated());
        $promptChars = strlen($input->title).'|'.strlen($input->content);

        try {
            $suggestions = $this->editorialSuggestionService->suggest($input);
        } catch (Throwable $exception) {
            Log::error('ai_editorial_suggestions_failed', [
                'user_id' => $user?->id,
                'request_id' => app()->bound('request_id') ? app('request_id') : null,
                'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'prompt_sizes' => $promptChars,
                'error_class' => $exception::class,
                'error_message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'AI assistant is temporarily unavailable. Continue in manual mode.',
                'data' => [
                    'excerpt' => $input->excerpt,
                    'tags' => $input->tags,
                ],
            ], 500);
        }

        Log::info('ai_editorial_suggestions_success', [
            'user_id' => $user?->id,
            'request_id' => app()->bound('request_id') ? app('request_id') : null,
            'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'prompt_sizes' => $promptChars,
            'suggested_tags_count' => count($suggestions->tags),
            // Rough estimator only; avoid persisting prompt content.
            'estimated_tokens' => (int) ceil((strlen($input->title).strlen($input->content)) / 4),
        ]);

        return response()->json([
            'message' => 'Suggestions generated successfully.',
            'data' => $suggestions->toArray(),
        ]);
    }
}
