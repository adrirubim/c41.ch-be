<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->string('hero_image_base', 64)->nullable()->after('featured');
            $table->string('hero_image_alt_text', 255)->nullable()->after('hero_image_base');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->string('image_base', 64)->nullable()->after('color');
            $table->string('image_alt_text', 255)->nullable()->after('image_base');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->dropColumn(['hero_image_alt_text', 'hero_image_base']);
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn(['image_alt_text', 'image_base']);
        });
    }
};

