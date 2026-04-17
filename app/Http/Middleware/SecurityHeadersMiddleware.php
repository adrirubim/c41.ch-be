<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $isLocal = app()->environment('local') || (bool) config('app.debug', false);
        $nonce = null;
        if (! $isLocal) {
            $nonce = Str::random(32);
            app()->instance('csp_nonce', $nonce);
        }

        // CSP tuned for this app:
        // - Production: no unsafe-eval, no ws, mask third-party sources.
        // - Local/dev: allow Vite HMR and eval for fast refresh / devtools.
        $viteDevLocalhost = 'http://localhost:5173';
        $viteDevLoopback = 'http://127.0.0.1:5173';
        $viteWsLocalhost = 'ws://localhost:5173';
        $viteWsLoopback = 'ws://127.0.0.1:5173';

        $scriptSrc = $isLocal
            ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' {$viteDevLocalhost} {$viteDevLoopback}"
            : "script-src 'self' 'nonce-{$nonce}'";

        $connectSrc = $isLocal
            ? "connect-src 'self' {$viteWsLocalhost} {$viteWsLoopback} ws: wss: http: https:"
            : "connect-src 'self' https:";

        $csp = implode('; ', array_filter([
            "default-src 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
            $isLocal
                ? "style-src 'self' 'unsafe-inline' {$viteDevLocalhost} {$viteDevLoopback} https://fonts.googleapis.com https://fonts.bunny.net"
                : "style-src 'self' 'nonce-{$nonce}' https://fonts.googleapis.com https://fonts.bunny.net",
            $scriptSrc,
            $connectSrc,
            $isLocal ? null : 'upgrade-insecure-requests',
        ]));

        $response->headers->set('Content-Security-Policy', $csp);
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
