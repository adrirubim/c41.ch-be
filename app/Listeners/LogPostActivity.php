<?php

namespace App\Listeners;

use App\Events\PostCreated;
use App\Events\PostDeleted;
use App\Events\PostUpdated;
use Illuminate\Support\Facades\Log;

class LogPostActivity
{
    /**
     * Handle the event.
     */
    public function handle(PostCreated|PostUpdated|PostDeleted $event): void
    {
        $action = match (true) {
            $event instanceof PostCreated => 'created',
            $event instanceof PostUpdated => 'updated',
            $event instanceof PostDeleted => 'deleted',
            default => 'unknown',
        };

        Log::info("Post {$action}", [
            'post_id' => $event->post->id,
            'post_title' => $event->post->title,
            'user_id' => $event->post->user_id,
        ]);
    }
}
