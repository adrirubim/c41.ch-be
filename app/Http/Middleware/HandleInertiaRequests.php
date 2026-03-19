<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Set the root URL for Inertia requests.
     * This ensures all Inertia routes respect the subdirectory.
     */
    public function rootUrl(Request $request): string
    {
        return config('app.url');
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $messageText = trim((string) $message);
        $authorText = trim((string) $author);

        // Resolve the base URL path for subdirectory deployments.
        $appUrl = config('app.url');
        $basePath = parse_url($appUrl, PHP_URL_PATH) ?: '';

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => $messageText, 'author' => $authorText],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
            ],
            // Share base path with frontend route helpers.
            'basePath' => $basePath,
        ];
    }
}
