<?php

use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');
Route::get('/blog', [\App\Http\Controllers\PublicPostController::class, 'index'])->name('public.posts.index');
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicPostController::class, 'show'])->name('public.posts.show');

// Sitemap (público)
Route::get('sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Subida de imágenes
    Route::post('upload-image', [\App\Http\Controllers\ImageUploadController::class, 'upload'])
        ->middleware('throttle:posts')
        ->name('upload.image');

    // Rutas de Posts
    Route::get('posts', [\App\Http\Controllers\PostController::class, 'index'])
        ->middleware('throttle:search')
        ->name('posts.index');
    Route::get('posts/create', [\App\Http\Controllers\PostController::class, 'create'])->name('posts.create');
    Route::post('posts', [\App\Http\Controllers\PostController::class, 'store'])
        ->middleware('throttle:posts')
        ->name('posts.store');
    Route::get('posts/{post}', [\App\Http\Controllers\PostController::class, 'show'])->name('posts.show');
    Route::get('posts/{post}/edit', [\App\Http\Controllers\PostController::class, 'edit'])->name('posts.edit');
    Route::put('posts/{post}', [\App\Http\Controllers\PostController::class, 'update'])
        ->middleware('throttle:posts')
        ->name('posts.update');
    Route::delete('posts/{post}', [\App\Http\Controllers\PostController::class, 'destroy'])
        ->middleware('throttle:posts')
        ->name('posts.destroy');

    // Rutas de Categorías (prefijo dashboard para no chocar con /categories/{slug} público)
    Route::get('dashboard/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
    Route::get('dashboard/categories/new', [\App\Http\Controllers\CategoryController::class, 'create'])->name('categories.create');
    Route::post('dashboard/categories', [\App\Http\Controllers\CategoryController::class, 'store'])
        ->middleware('throttle:categories')
        ->name('categories.store');
    Route::get('dashboard/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'show'])
        ->name('categories.show')
        ->where('category', '[0-9]+');
    Route::get('dashboard/categories/{category}/edit', [\App\Http\Controllers\CategoryController::class, 'edit'])
        ->name('categories.edit')
        ->where('category', '[0-9]+');
    Route::put('dashboard/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])
        ->middleware('throttle:categories')
        ->name('categories.update');
    Route::delete('dashboard/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])
        ->middleware('throttle:categories')
        ->name('categories.destroy')
        ->where('category', '[0-9]+');
});

// Public category routes
Route::get('/categories', [\App\Http\Controllers\PublicCategoryController::class, 'index'])->name('public.categories.index');
Route::get('/categories/{slug}', [\App\Http\Controllers\PublicCategoryController::class, 'show'])->name('public.categories.show');

require __DIR__.'/settings.php';
