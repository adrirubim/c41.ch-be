<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RequestId;
use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        // Daily compressed DB dump (02:00 server time)
        $schedule->command('app:db-backup')->dailyAt('02:00')->withoutOverlapping();

        // Weekly orphan media cleanup (Sunday 03:00)
        $schedule->command('app:media-cleanup')->weeklyOn(0, '03:00')->withoutOverlapping();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            RequestId::class,
            SecurityHeadersMiddleware::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            RequestId::class,
            SecurityHeadersMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (Throwable $e, Request $request) {
            if (! app()->isProduction()) {
                return null;
            }

            $requestId = app()->bound('request_id') ? (string) app('request_id') : null;

            // High-priority logging for critical public and infra endpoints.
            $isCriticalPath = $request->is('/')
                || $request->is('blog')
                || $request->is('blog/*')
                || $request->is('categories')
                || $request->is('categories/*')
                || $request->is('api/health');

            if ($isCriticalPath) {
                Log::critical('critical_path_exception', [
                    'request_id' => $requestId,
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'error_class' => $e::class,
                    'error_message' => $e->getMessage(),
                ]);
            } else {
                Log::error('unhandled_exception', [
                    'request_id' => $requestId,
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'error_class' => $e::class,
                    'error_message' => $e->getMessage(),
                ]);
            }

            // Mask details to clients for JSON requests in production.
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Server error.',
                    'request_id' => $requestId,
                ], 500);
            }

            return null;
        });

        $exceptions->renderable(function (Throwable $e, Request $request) {
            if ($request->expectsJson()) {
                return null;
            }

            if (! $request->isMethod('get')) {
                return null;
            }

            if (! $e instanceof HttpExceptionInterface) {
                return null;
            }

            $status = $e->getStatusCode();
            if (! in_array($status, [401, 403, 404, 419, 422, 429, 500], true)) {
                return null;
            }

            $title = match ($status) {
                401 => 'Not authenticated',
                403 => 'Access denied',
                404 => 'Page not found',
                419 => 'Page expired',
                422 => 'Validation error',
                429 => 'Too many requests',
                500 => 'Something went wrong',
            };

            $description = match ($status) {
                401 => 'Please sign in to continue.',
                403 => 'You do not have permission to access this resource.',
                404 => 'The page you are looking for could not be found.',
                419 => 'This page has expired. Please refresh and try again.',
                422 => 'There was a problem with the data you submitted. Please review the form and try again.',
                429 => 'You have made too many requests in a short period. Please wait a moment and try again.',
                500 => 'An unexpected error occurred. Please try again in a moment.',
            };

            return Inertia::render('errors/status', [
                'status' => $status,
                'title' => $title,
                'description' => $description,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
