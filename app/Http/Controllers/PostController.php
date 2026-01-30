<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use App\Services\CategoryService;
use App\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private PostService $postService,
        private CategoryService $categoryService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'published', 'featured', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 15);

        $posts = $this->postService->getFiltered($filters, $perPage);
        $categories = $this->categoryService->getAll();

        return Inertia::render('posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $categories = $this->categoryService->getAll();
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('posts/create', [
            'categories' => $categories,
            'users' => $users,
            'defaultUserId' => $request->user()->id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // If user_id is not specified, use the authenticated user
        if (empty($validated['user_id'] ?? null)) {
            $validated['user_id'] = $request->user()->id;
        }

        // If published but no date, use now
        if (($validated['published'] ?? false) && empty($validated['published_at'] ?? null)) {
            $validated['published_at'] = now();
        }

        $categoryIds = $request->has('categories') ? $request->categories : null;
        $this->postService->create($validated, $categoryIds);

        return redirect()->route('posts.index')
            ->with('success', 'Post creado exitosamente.');
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

        $post->load('categories');
        $categories = $this->categoryService->getAll();
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('posts/edit', [
            'post' => $post,
            'categories' => $categories,
            'users' => $users,
            'defaultUserId' => $request->user()->id,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);

        $validated = $request->validated();

        // If user_id is not specified, use the authenticated user
        if (empty($validated['user_id'] ?? null)) {
            $validated['user_id'] = $request->user()->id;
        }

        // If published but no date, use now
        if (($validated['published'] ?? false) && empty($validated['published_at'] ?? null)) {
            $validated['published_at'] = now();
        }

        // If unpublished, clear date
        if (! ($validated['published'] ?? false)) {
            $validated['published_at'] = null;
        }

        $categoryIds = $request->has('categories') ? $request->categories : [];
        $this->postService->update($post, $validated, $categoryIds);

        return redirect()->route('posts.index')
            ->with('success', 'Post actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        $this->postService->delete($post);

        return redirect()->route('posts.index')
            ->with('success', 'Post eliminado exitosamente.');
    }
}
