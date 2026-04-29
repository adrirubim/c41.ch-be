<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class MediaService
{
    /**
     * Store an image for a model and generate responsive conversions.
     *
     * Conversions:
     * - thumb: 400px wide (webp + jpg)
     * - hero: 1200px wide (webp + jpg)
     *
     * Returns the generated "base" directory key (non-predictable).
     */
    public function storeResponsiveImage(
        UploadedFile $file,
        string $folder,
        int $thumbWidth = 400,
        int $heroWidth = 1200,
    ): string {
        if (! extension_loaded('gd')) {
            throw new RuntimeException('GD extension is required for image processing.');
        }

        $base = Str::lower(Str::uuid()->toString());
        $dir = "media/{$folder}/{$base}";

        $disk = Storage::disk('public');

        // Store original with a fixed name (keeps URL stable while base stays unpredictable).
        $originalPath = "{$dir}/original";
        $contents = file_get_contents($file->getRealPath());
        if ($contents === false) {
            throw new RuntimeException('Unable to read uploaded file.');
        }
        $disk->put($originalPath, $contents, 'public');

        $image = $this->loadGdImage($file);
        [$w, $h] = [imagesx($image), imagesy($image)];

        $thumb = $this->resizeToWidth($image, $w, $h, $thumbWidth);
        $hero = $this->resizeToWidth($image, $w, $h, $heroWidth);

        $disk->put("{$dir}/thumb.webp", $this->encodeWebp($thumb), 'public');
        $disk->put("{$dir}/thumb.jpg", $this->encodeJpeg($thumb), 'public');
        $disk->put("{$dir}/hero.webp", $this->encodeWebp($hero), 'public');
        $disk->put("{$dir}/hero.jpg", $this->encodeJpeg($hero), 'public');

        imagedestroy($image);
        imagedestroy($thumb);
        imagedestroy($hero);

        return $base;
    }

    private function loadGdImage(UploadedFile $file): \GdImage
    {
        $path = $file->getRealPath();
        if (! is_string($path) || $path === '') {
            throw new RuntimeException('Invalid upload path.');
        }

        $mime = (string) $file->getMimeType();

        $image = match ($mime) {
            'image/jpeg', 'image/jpg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            'image/gif' => imagecreatefromgif($path),
            'image/webp' => imagecreatefromwebp($path),
            default => throw new RuntimeException("Unsupported image mime type: {$mime}"),
        };

        if (! ($image instanceof \GdImage)) {
            throw new RuntimeException('Failed to load image via GD.');
        }

        return $image;
    }

    private function resizeToWidth(\GdImage $src, int $srcW, int $srcH, int $targetW): \GdImage
    {
        if ($srcW <= 0 || $srcH <= 0) {
            throw new RuntimeException('Invalid source image dimensions.');
        }

        if ($targetW <= 0) {
            throw new RuntimeException('Invalid target width.');
        }

        if ($targetW >= $srcW) {
            // Avoid upscaling; return a copy.
            $dst = imagecreatetruecolor($srcW, $srcH);
            if (! ($dst instanceof \GdImage)) {
                throw new RuntimeException('Failed to create GD image.');
            }
            imagecopy($dst, $src, 0, 0, 0, 0, $srcW, $srcH);

            return $dst;
        }

        $ratio = $srcH / $srcW;
        $targetH = max(1, (int) round($targetW * $ratio));

        $dst = imagecreatetruecolor($targetW, $targetH);
        if (! ($dst instanceof \GdImage)) {
            throw new RuntimeException('Failed to create GD image.');
        }

        // Preserve transparency for PNG/GIF → fill background white for JPG fallback.
        $white = imagecolorallocate($dst, 255, 255, 255);
        if ($white === false) {
            throw new RuntimeException('Failed to allocate GD color.');
        }
        imagefill($dst, 0, 0, $white);

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetW, $targetH, $srcW, $srcH);

        return $dst;
    }

    private function encodeWebp(\GdImage $image, int $quality = 82): string
    {
        ob_start();
        imagewebp($image, null, $quality);
        $data = ob_get_clean();
        if (! is_string($data)) {
            throw new RuntimeException('Failed to encode WebP.');
        }

        return $data;
    }

    private function encodeJpeg(\GdImage $image, int $quality = 82): string
    {
        ob_start();
        imagejpeg($image, null, $quality);
        $data = ob_get_clean();
        if (! is_string($data)) {
            throw new RuntimeException('Failed to encode JPEG.');
        }

        return $data;
    }
}
