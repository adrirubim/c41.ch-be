<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class HealthController
{
    public function __invoke(): JsonResponse
    {
        $requestId = app()->bound('request_id') ? (string) app('request_id') : null;

        $checks = [
            'db' => ['ok' => false, 'error' => null],
            'cache' => ['ok' => false, 'error' => null],
            'media' => ['ok' => false, 'error' => null],
        ];

        try {
            DB::connection()->getPdo();
            $checks['db']['ok'] = true;
        } catch (Throwable $exception) {
            $checks['db']['error'] = $exception->getMessage();
        }

        try {
            $key = 'healthcheck:ping';
            Cache::put($key, 'pong', 10);
            $checks['cache']['ok'] = Cache::get($key) === 'pong';
            Cache::forget($key);
        } catch (Throwable $exception) {
            $checks['cache']['error'] = $exception->getMessage();
        }

        try {
            $disk = Storage::disk('public');
            $path = 'healthcheck/media-write-test.txt';
            $ok = $disk->put($path, 'ok', 'public');
            $disk->delete($path);
            $checks['media']['ok'] = $ok === true;
        } catch (Throwable $exception) {
            $checks['media']['error'] = $exception->getMessage();
        }

        $allOk = $checks['db']['ok'] === true
            && $checks['cache']['ok'] === true
            && $checks['media']['ok'] === true;

        if (! $allOk) {
            Log::error('healthcheck_failed', [
                'request_id' => $requestId,
                'checks' => $checks,
            ]);
        }

        return response()->json([
            'ok' => $allOk,
            'request_id' => $requestId,
            'checks' => $checks,
        ], $allOk ? 200 : 503);
    }
}

