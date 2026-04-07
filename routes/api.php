<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::middleware('throttle:api_general')->group(function (): void {
    Route::get('/health', function (Request $request) {
        $requestId = app()->bound('request_id') ? (string) app('request_id') : null;

        $dbOk = true;
        $dbError = null;
        try {
            DB::select('select 1');
        } catch (Throwable $e) {
            $dbOk = false;
            $dbError = $e->getMessage();
        }

        $cacheOk = true;
        $cacheError = null;
        try {
            $key = 'health:'.bin2hex(random_bytes(8));
            Cache::put($key, 'ok', 10);
            $cacheOk = Cache::get($key) === 'ok';
            Cache::forget($key);
        } catch (Throwable $e) {
            $cacheOk = false;
            $cacheError = $e->getMessage();
        }

        $mediaOk = true;
        $mediaError = null;
        try {
            $disk = Storage::disk('public');
            $path = 'healthchecks/'.bin2hex(random_bytes(8)).'.txt';
            $disk->put($path, 'ok');
            $mediaOk = $disk->exists($path);
            $disk->delete($path);
        } catch (Throwable $e) {
            $mediaOk = false;
            $mediaError = $e->getMessage();
        }

        $ok = $dbOk && $cacheOk && $mediaOk;

        $payload = [
            'ok' => $ok,
            'request_id' => $requestId,
            'checks' => [
                'db' => ['ok' => $dbOk, 'error' => $dbError],
                'cache' => ['ok' => $cacheOk, 'error' => $cacheError],
                'media' => ['ok' => $mediaOk, 'error' => $mediaError],
            ],
        ];

        return response()->json($payload, $ok ? 200 : 503);
    });

    Route::post('/client-error', function (Request $request) {
        $requestId = app()->bound('request_id') ? (string) app('request_id') : null;

        /** @var array<string, mixed> $data */
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'url' => ['nullable', 'string', 'max:2000'],
            'stack' => ['nullable', 'string', 'max:20000'],
            'userAgent' => ['nullable', 'string', 'max:2000'],
            'componentStack' => ['nullable', 'string', 'max:20000'],
            'level' => ['nullable', 'string', 'in:error,warning,info'],
            'tags' => ['nullable', 'array'],
        ]);

        Log::warning('client_error', [
            'request_id' => $requestId,
            'ip' => $request->ip(),
            'level' => $data['level'] ?? 'error',
            'message' => $data['message'],
            'url' => $data['url'] ?? null,
            'user_agent' => $data['userAgent'] ?? null,
            'stack' => $data['stack'] ?? null,
            'component_stack' => $data['componentStack'] ?? null,
            'tags' => $data['tags'] ?? null,
        ]);

        return response()->json([
            'ok' => true,
            'request_id' => $requestId,
        ]);
    });
});
