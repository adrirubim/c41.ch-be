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
        if ($event instanceof CategoryCreated) {
            $action = 'created';
        } elseif ($event instanceof CategoryUpdated) {
            $action = 'updated';
        } else {
            $action = 'deleted';
        }

        Log::info("Category {$action}", [
            'category_id' => $event->category->id,
            'category_name' => $event->category->name,
        ]);
    }
}
