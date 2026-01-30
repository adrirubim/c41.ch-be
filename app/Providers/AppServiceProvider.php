<?php

namespace App\Providers;

use App\Repositories\CategoryRepository;
use App\Repositories\PostRepository;
use App\Services\CategoryService;
use App\Services\PostService;
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
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\PostCreated::class,
            \App\Listeners\LogPostActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\PostUpdated::class,
            \App\Listeners\LogPostActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\PostDeleted::class,
            \App\Listeners\LogPostActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CategoryCreated::class,
            \App\Listeners\LogCategoryActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CategoryUpdated::class,
            \App\Listeners\LogCategoryActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CategoryDeleted::class,
            \App\Listeners\LogCategoryActivity::class
        );
    }
}
