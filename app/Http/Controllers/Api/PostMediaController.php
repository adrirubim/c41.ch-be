<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\Post;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PostMediaController
{
    public function __construct(
        private MediaService $mediaService
    ) {}

    public function store(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'alt_text' => ['required', 'string', 'max:255'],
        ]);

        // Remove existing media directory if present.
        if (is_string($post->hero_image_base) && $post->hero_image_base !== '') {
            Storage::disk('public')->deleteDirectory('media/posts/'.$post->hero_image_base);
        }

        /** @var UploadedFile $file */
        $file = $validated['image'];
        $base = $this->mediaService->storeResponsiveImage($file, 'posts');

        $post->hero_image_base = $base;
        $post->hero_image_alt_text = $validated['alt_text'];
        $post->save();

        return response()->json([
            'ok' => true,
            'base' => $base,
            'alt_text' => $post->hero_image_alt_text,
            'urls' => $post->hero_image_urls,
        ]);
    }
}
