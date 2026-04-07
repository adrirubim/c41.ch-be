<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Ensure the authenticated user is an admin.
     *
     * Auth/verification are enforced by route middleware; this only gates admin access.
     */
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            abort(403, 'Unauthorized.');
        }

        if ($user->is_admin !== true) {
            return redirect()->route('public.posts.index');
        }

        return $next($request);
    }
}

