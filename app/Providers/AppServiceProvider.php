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
use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use App\Services\CategoryService;
use App\Services\PostService;
use Illuminate\Support\Facades\Event;
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
