<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientErrorLogController
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'stack' => ['nullable', 'string', 'max:20000'],
            'componentStack' => ['nullable', 'string', 'max:20000'],
            'url' => ['required', 'string', 'max:2000'],
            'userAgent' => ['nullable', 'string', 'max:2000'],
            'request_id' => ['nullable', 'string', 'max:200'],
            'user' => ['nullable', 'array'],
            'user.id' => ['nullable', 'integer'],
            'user.email' => ['nullable', 'string', 'max:255'],
            'user.is_admin' => ['nullable', 'boolean'],
        ]);

        Log::critical('frontend_component_crash', [
            'request_id' => $validated['request_id'] ?? (app()->bound('request_id') ? app('request_id') : null),
            'url' => $validated['url'],
            'user_agent' => $validated['userAgent'] ?? null,
            'user' => $validated['user'] ?? null,
            'error_message' => $validated['message'],
            'stack' => $validated['stack'] ?? null,
            'component_stack' => $validated['componentStack'] ?? null,
        ]);

        return response()->json([], 204);
    }
}
