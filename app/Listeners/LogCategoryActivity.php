<?php

namespace App\Listeners;

use App\Events\CategoryCreated;
use App\Events\CategoryDeleted;
use App\Events\CategoryUpdated;
use Illuminate\Support\Facades\Log;

class LogCategoryActivity
{
    /**
     * Handle the event.
     */
    public function handle(CategoryCreated|CategoryUpdated|CategoryDeleted $event): void
    {
        $action = match (true) {
            $event instanceof CategoryCreated => 'created',
            $event instanceof CategoryUpdated => 'updated',
            $event instanceof CategoryDeleted => 'deleted',
            default => 'unknown',
        };

        Log::info("Category {$action}", [
            'category_id' => $event->category->id,
            'category_name' => $event->category->name,
        ]);
    }
}
