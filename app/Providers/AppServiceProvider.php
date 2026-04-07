<?php

namespace App\Providers;

use App\Events\CategoryCreated;
use App\Events\CategoryDeleted;
use App\Events\CategoryUpdated;
use App\Events\PostCreated;
use App\Events\PostDeleted;
use App\Events\PostUpdated;
use App\Listeners\LogCategoryActivity;
use App\Listeners\LogPostActivity;
use App\Models\Category;
use App\Models\Post;
use App\Observers\CategoryObserver;
use App\Observers\PostObserver;
use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use App\Services\CategoryService;
use App\Services\PostService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar Repositories
        $this->app->singleton(PostRepository::class);
        $this->app->singleton(CategoryRepository::class);

        // Registrar Services
        $this->app->singleton(PostService::class, function ($app) {
            return new PostService($app->make(PostRepository::class));
        });

        $this->app->singleton(CategoryService::class, function ($app) {
            return new CategoryService($app->make(CategoryRepository::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Post::observe(PostObserver::class);
        Category::observe(CategoryObserver::class);

        RateLimiter::for('api_general', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('api_expensive', function (Request $request) {
            // AI, search, or any endpoint with cost/CPU spikes.
            return Limit::perMinute(15)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public_content', function (Request $request) {
            // Public read routes: generous but safe.
            return Limit::perMinute(240)->by($request->ip());
        });

        // Register event listeners
        Event::listen(
            PostCreated::class,
            LogPostActivity::class
        );

        Event::listen(
            PostUpdated::class,
            LogPostActivity::class
        );

        Event::listen(
            PostDeleted::class,
            LogPostActivity::class
        );

        Event::listen(
            CategoryCreated::class,
            LogCategoryActivity::class
        );

        Event::listen(
            CategoryUpdated::class,
            LogCategoryActivity::class
        );

        Event::listen(
            CategoryDeleted::class,
            LogCategoryActivity::class
        );
    }
}
