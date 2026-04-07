<?php

use App\Models\Category;
use App\Models\Post;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:db-backup', function () {
    $this->info('Starting database backup...');

    $connection = (string) config('database.default');
    $dbConfig = config("database.connections.{$connection}");

    if (! is_array($dbConfig)) {
        $this->error("Unknown DB connection: {$connection}");
        return 1;
    }

    $timestamp = Carbon::now()->format('Y-m-d_His');
    $dir = "backups/db";
    $disk = Storage::disk('local');
    $disk->makeDirectory($dir);

    $baseFilename = "{$dir}/{$connection}_{$timestamp}.sql";
    $gzFilename = "{$baseFilename}.gz";

    $driver = (string) ($dbConfig['driver'] ?? '');

    if ($driver === 'sqlite') {
        $databasePath = (string) ($dbConfig['database'] ?? '');
        if ($databasePath === ':memory:' || $databasePath === '') {
            $this->warn('SQLite database is in-memory or missing; skipping backup.');
            return 0;
        }

        $raw = @file_get_contents($databasePath);
        if (! is_string($raw)) {
            $this->error("Failed to read sqlite db at {$databasePath}");
            return 1;
        }

        $gz = gzencode($raw, 9);
        if (! is_string($gz)) {
            $this->error('Failed to gzip sqlite backup.');
            return 1;
        }

        $disk->put($gzFilename, $gz);
        $this->info("Backup created: storage/app/{$gzFilename}");
        return 0;
    }

    if (! class_exists(Process::class)) {
        $this->error('Symfony Process is required for DB dumps.');
        return 1;
    }

    $host = (string) ($dbConfig['host'] ?? '127.0.0.1');
    $port = (string) ($dbConfig['port'] ?? '');
    $database = (string) ($dbConfig['database'] ?? '');
    $username = (string) ($dbConfig['username'] ?? '');
    $password = (string) ($dbConfig['password'] ?? '');

    $tmpPath = storage_path('app/'.str_replace('/', DIRECTORY_SEPARATOR, $baseFilename));
    $tmpGzPath = storage_path('app/'.str_replace('/', DIRECTORY_SEPARATOR, $gzFilename));

    @mkdir(dirname($tmpPath), 0755, true);

    if ($driver === 'mysql') {
        $cmd = [
            'mysqldump',
            '--single-transaction',
            '--quick',
            '--skip-lock-tables',
            '-h', $host,
            '-u', $username,
        ];
        if ($port !== '') {
            $cmd[] = '-P';
            $cmd[] = $port;
        }
        $cmd[] = $database;

        $process = new Process($cmd, null, $password !== '' ? ['MYSQL_PWD' => $password] : null);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('mysqldump failed: '.$process->getErrorOutput());
            return 1;
        }

        file_put_contents($tmpPath, $process->getOutput());
    } elseif ($driver === 'pgsql') {
        $cmd = [
            'pg_dump',
            '-h', $host,
            '-U', $username,
            '-d', $database,
            '--no-owner',
            '--no-privileges',
        ];
        if ($port !== '') {
            $cmd[] = '-p';
            $cmd[] = $port;
        }

        $process = new Process($cmd, null, $password !== '' ? ['PGPASSWORD' => $password] : null);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('pg_dump failed: '.$process->getErrorOutput());
            return 1;
        }

        file_put_contents($tmpPath, $process->getOutput());
    } else {
        $this->warn("Unsupported driver for automated dump: {$driver}");
        return 0;
    }

    $raw = file_get_contents($tmpPath);
    if (! is_string($raw)) {
        $this->error('Failed to read dump for compression.');
        return 1;
    }
    $gz = gzencode($raw, 9);
    if (! is_string($gz)) {
        $this->error('Failed to gzip dump.');
        return 1;
    }
    file_put_contents($tmpGzPath, $gz);
    @unlink($tmpPath);

    $this->info("Backup created: storage/app/{$gzFilename}");
    $this->line('Tip: sync storage/app/backups to S3 with a cron job (e.g. aws s3 sync) or via Laravel Flysystem disk.');

    return 0;
})->purpose('Create a compressed daily DB dump into storage/app/backups');

Artisan::command('app:media-cleanup', function () {
    $this->info('Starting media cleanup...');

    $disk = Storage::disk('public');

    $postBases = Post::withTrashed()
        ->whereNotNull('hero_image_base')
        ->pluck('hero_image_base')
        ->filter()
        ->map(fn ($v) => (string) $v)
        ->unique()
        ->values()
        ->all();

    $categoryBases = Category::withTrashed()
        ->whereNotNull('image_base')
        ->pluck('image_base')
        ->filter()
        ->map(fn ($v) => (string) $v)
        ->unique()
        ->values()
        ->all();

    $referenced = array_flip([...$postBases, ...$categoryBases]);

    $deletedDirs = 0;

    foreach (['media/posts', 'media/categories'] as $root) {
        $dirs = $disk->directories($root);

        foreach ($dirs as $dir) {
            $base = basename($dir);
            if ($base === '' || $base === '.' || $base === '..') {
                continue;
            }

            if (! array_key_exists($base, $referenced)) {
                $disk->deleteDirectory($dir);
                $deletedDirs++;
            }
        }
    }

    $this->info("Media cleanup done. Deleted orphan directories: {$deletedDirs}");

    return 0;
})->purpose('Delete orphan public/media directories not referenced by DB');
