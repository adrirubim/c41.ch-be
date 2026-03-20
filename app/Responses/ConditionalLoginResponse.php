<?php

declare(strict_types=1);

namespace App\Responses;

use Laravel\Fortify\Contracts\LoginResponse;
use Symfony\Component\HttpFoundation\Response;

final class ConditionalLoginResponse implements LoginResponse
{
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            // Preserve Fortify's default JSON payload used by XHR/AJAX login flows.
            /** @var \Illuminate\Http\JsonResponse $jsonResponse */
            $jsonResponse = response()->json(['two_factor' => false]);

            return $jsonResponse;
        }

        $user = $request->user();

        $email = null;
        if ($user !== null) {
            $emailCandidate = $user->email ?? null;

            if ($emailCandidate !== null) {
                $email = $emailCandidate;
            }
        }

        $isAdmin = false;
        if ($user !== null) {
            $isAdmin = $user->is_admin === true;
        }

        $redirectPath = ($email === 'admin@example.com' || $isAdmin) ? '/dashboard' : '/blog';

        return redirect($redirectPath);
    }
}

