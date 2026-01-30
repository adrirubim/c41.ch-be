<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload an image and return its URL
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB maximum
        ]);

        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('posts/images', $filename, 'public');

        $url = Storage::disk('public')->url($path);

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }
}
