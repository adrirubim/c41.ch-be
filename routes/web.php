<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PublicCategoryController;
use App\Http\Controllers\PublicPostController;
use App\Http\Controllers\SitemapController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

// Local dev helper: when serving via `php artisan serve`, Apache/Nginx rewrite rules
// are not applied. Vite's modulepreload can request `/assets/*`, which are actually
// located under `public/build/assets/*` in this project. In production, the web server
// should handle this mapping; locally we serve them through Laravel.
if (app()->environment('local')) {
    Route::get('/assets/{path}', function (string $path) {
        $fullPath = public_path("build/assets/{$path}");

        if (! File::exists($fullPath)) {
            abort(404);
        }

        return response()->file($fullPath);
    })->where('path', '.*');
}

// Enterprise: protect Blog and Categories

// Public sitemap
Route::get('sitemap.xml', [SitemapController::class, 'index'])
    ->middleware('throttle:public_content')
    ->name('sitemap');

// Landing public homepage
Route::get('/', [HomeController::class, 'index'])
    ->middleware('throttle:public_content')
    ->name('home');

// Public Blog and Categories (SEO friendly; no auth wall)
Route::get('/blog', [PublicPostController::class, 'index'])
    ->middleware('throttle:public_content')
    ->name('public.posts.index');
Route::get('/blog/{slug}', [PublicPostController::class, 'show'])
    ->middleware('throttle:public_content')
    ->name('public.posts.show');
Route::get('/categories', [PublicCategoryController::class, 'index'])
    ->middleware('throttle:public_content')
    ->name('public.categories.index');
Route::get('/categories/{slug}', [PublicCategoryController::class, 'show'])
    ->middleware('throttle:public_content')
    ->name('public.categories.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware([EnsureAdmin::class])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Category routes (dashboard prefix to avoid clashing with public /categories/{slug})
        Route::get('dashboard/categories', [CategoryController::class, 'index'])
            ->middleware('can:viewAny,App\\Models\\Category')
            ->name('categories.index');
        Route::get('dashboard/categories/new', [CategoryController::class, 'create'])
            ->middleware('can:create,App\\Models\\Category')
            ->name('categories.create');
        Route::post('dashboard/categories', [CategoryController::class, 'store'])
            ->middleware('throttle:categories')
            ->middleware('can:create,App\\Models\\Category')
            ->name('categories.store');
        Route::get('dashboard/categories/{category}', [CategoryController::class, 'show'])
            ->name('categories.show')
            ->where('category', '[0-9]+');
        Route::get('dashboard/categories/{category}/edit', [CategoryController::class, 'edit'])
            ->middleware('can:update,category')
            ->name('categories.edit')
            ->where('category', '[0-9]+');
        Route::put('dashboard/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('throttle:categories')
            ->middleware('can:update,category')
            ->name('categories.update');
        Route::delete('dashboard/categories/{category}', [CategoryController::class, 'destroy'])
            ->middleware('throttle:categories')
            ->middleware('can:delete,category')
            ->name('categories.destroy')
            ->where('category', '[0-9]+');
    });

    // Image upload
    Route::post('upload-image', [ImageUploadController::class, 'upload'])
        ->middleware('throttle:posts')
        ->name('upload.image');

    // Rutas de Posts
    Route::get('posts', [PostController::class, 'index'])
        ->middleware('throttle:search')
        ->middleware('throttle:api_expensive')
        ->name('posts.index');
    Route::get('posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('posts', [PostController::class, 'store'])
        ->middleware('throttle:posts')
        ->name('posts.store');
    Route::post('posts/editorial-suggestions', [PostController::class, 'editorialSuggestions'])
        ->middleware('throttle:ai-editorial')
        ->middleware('throttle:api_expensive')
        ->middleware('can:useEditorialSuggestions,App\\Models\\Post')
        ->name('posts.editorial-suggestions');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::get('posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('posts/{post}', [PostController::class, 'update'])
        ->middleware('throttle:posts')
        ->name('posts.update');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])
        ->middleware('throttle:posts')
        ->name('posts.destroy');

});

require __DIR__.'/settings.php';
