<?php

namespace App\Logging;

class RequestIdProcessor
{
    public function __invoke(array $record): array
    {
        $requestId = app()->bound('request_id') ? app('request_id') : null;

        if ($requestId !== null) {
            $record['extra']['request_id'] = $requestId;
        }

        return $record;
    }
}

