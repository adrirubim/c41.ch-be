<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'ai' => [
        'enabled' => env('AI_ENABLED', false),
        'editorial_admin_only' => env('AI_EDITORIAL_ADMIN_ONLY', true),
        'editorial_rate_limit_attempts' => env('AI_EDITORIAL_RATE_LIMIT_ATTEMPTS', 6),
        'provider' => env('AI_PROVIDER', 'openai'),
        'model' => env('AI_MODEL', 'gpt-4o-mini'),
        'openai_api_key' => env('OPENAI_API_KEY'),
    ],

    'search' => [
        'hybrid_enabled' => env('SEARCH_HYBRID_ENABLED', false),
        'semantic_enabled' => env('SEARCH_SEMANTIC_ENABLED', false),
    ],

];
