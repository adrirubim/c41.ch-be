<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('category', 100)->nullable()->after('excerpt');
            $table->json('tags')->nullable()->after('category');
            $table->unsignedInteger('views_count')->default(0)->after('tags');
            $table->boolean('featured')->default(false)->after('views_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['category', 'tags', 'views_count', 'featured']);
        });
    }
};
