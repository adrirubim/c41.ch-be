<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Category\DTO\CategoryUpsertData;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {
        // Access control is enforced by route middleware + Policies.
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response|RedirectResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = $this->categoryService->getAllWithPostCount()
            ->sortBy('name')
            ->values();

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        $this->authorize('create', Category::class);

        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', Category::class);

        $categoryData = CategoryUpsertData::fromValidated($request->validated());
        $this->categoryService->create($categoryData);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): RedirectResponse
    {
        // Redirect to posts list filtered by this category
        return redirect()->route('posts.index', ['category' => $category->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response|RedirectResponse
    {
        $this->authorize('update', $category);

        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $categoryData = CategoryUpsertData::fromValidated($request->validated());
        $this->categoryService->update($category, $categoryData);

        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $this->categoryService->delete($category);

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
