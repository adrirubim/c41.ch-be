<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\Category;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryMediaController
{
    public function __construct(
        private MediaService $mediaService
    ) {}

    public function store(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'alt_text' => ['required', 'string', 'max:255'],
        ]);

        if (is_string($category->image_base) && $category->image_base !== '') {
            Storage::disk('public')->deleteDirectory('media/categories/'.$category->image_base);
        }

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['image'];
        $base = $this->mediaService->storeResponsiveImage($file, 'categories');

        $category->image_base = $base;
        $category->image_alt_text = $validated['alt_text'];
        $category->save();

        return response()->json([
            'ok' => true,
            'base' => $base,
            'alt_text' => $category->image_alt_text,
            'urls' => $category->image_urls,
        ]);
    }
}

