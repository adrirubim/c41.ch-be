<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $connection = Schema::getConnection();

        // En local usamos SQLite; los índices adicionales se aplicarán solo en
        // entornos que no sean SQLite (por ejemplo, Postgres en producción/CI).
        if ($connection->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('posts', function (Blueprint $table): void {
            // `slug` ya es único desde la migración original.
            if (! $this->indexExists('posts_published_published_at_index')) {
                $table->index(['published', 'published_at'], 'posts_published_published_at_index');
            }

            if (! $this->indexExists('posts_featured_index')) {
                $table->index('featured', 'posts_featured_index');
            }

            if (! $this->indexExists('posts_views_count_index')) {
                $table->index('views_count', 'posts_views_count_index');
            }
        });
    }

    public function down(): void
    {
        $connection = Schema::getConnection();

        if ($connection->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('posts', function (Blueprint $table): void {
            if ($this->indexExists('posts_published_published_at_index')) {
                $table->dropIndex('posts_published_published_at_index');
            }

            if ($this->indexExists('posts_featured_index')) {
                $table->dropIndex('posts_featured_index');
            }

            if ($this->indexExists('posts_views_count_index')) {
                $table->dropIndex('posts_views_count_index');
            }
        });
    }

    private function indexExists(string $indexName): bool
    {
        $connection = Schema::getConnection();
        $schemaManager = method_exists($connection, 'getDoctrineSchemaManager')
            ? $connection->getDoctrineSchemaManager()
            : null;

        if ($schemaManager === null) {
            // SQLite local u otros drivers sin Doctrine: asumimos que el índice no existe aún.
            return false;
        }

        $indexes = $schemaManager->listTableIndexes('posts');

        return array_key_exists($indexName, $indexes);
    }
};

