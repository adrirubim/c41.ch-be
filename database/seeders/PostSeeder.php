<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Services\HtmlPurifierService;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    private function clearDemoCache(): void
    {
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.recent_posts');
        Cache::forget('dashboard.popular_posts');
        Cache::forget('dashboard.categories_distribution');
        Cache::forget('categories.list');
        Cache::forget('categories.with_post_count');
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command?->info('PostSeeder: start');

        $demoTitlePrefixLegacy = 'C41-DEMO-';
        // Marker to identify demo posts without contaminating the title (the front-end displays `title`).
        $demoSlugPrefix = 'c41-demo-';
        $postTone = strtolower((string) env('SEED_POST_TONE', 'tecnico'));
        $resetDemo = filter_var(env('SEED_DEMO_RESET', false), FILTER_VALIDATE_BOOL);
        $defaultConnection = (string) config('database.default');
        $this->command?->info('PostSeeder: db_connection='.$defaultConnection);

        try {
            $dbName = DB::connection($defaultConnection)->getDatabaseName();
            $this->command?->info('PostSeeder: db_name='.($dbName ?? ''));
        } catch (\Throwable) {
            $this->command?->info('PostSeeder: db_name='.'(unknown)');
        }

        $categories = Category::query()->get();
        if ($categories->isEmpty()) {
            $this->call(CategorySeeder::class);
            $categories = Category::query()->get();
        }

        $this->command?->info('PostSeeder: categories='.$categories->count());

        $demoUsers = User::query()
            ->where('is_admin', false)
            ->pluck('id')
            ->all();

        $fallbackUserId = User::query()->first()?->id ?? User::factory()->create()->id;
        $purifier = app(HtmlPurifierService::class);

        // The robust "dev" seeder (idempotent):
        // - Generates "demo" data with Faker (no nested factories)
        // - Inserts via query-builder (avoids slow Eloquent events / hooks)
        // - Cleanup strategy:
        //   - If `SEED_DEMO_RESET=true`, remove ALL posts + pivots to keep the dataset stable.
        //   - If false, remove:
        //     - Demo posts identified by the slug marker `c41-demo-`
        //     - Legacy posts that had a title prefix `C41-DEMO-`
        //     - Legacy posts from the previous pattern `Seeded Post %`
        if ($resetDemo) {
            $this->command?->info('PostSeeder: SEED_DEMO_RESET=true -> clearing ALL posts + pivots');
            // In dev we want determinism: wipe cache to avoid serving stale dashboard/blog data.
            Cache::flush();
            DB::table('category_post')->delete();
            DB::table('posts')->delete();
        } else {
            $this->command?->info('PostSeeder: removing old demo posts (slug like '.$demoSlugPrefix.'%)');

            $oldDemoPostIds = Post::query()
                ->where('slug', 'like', $demoSlugPrefix.'%')
                ->pluck('id')
                ->all();

            if ($oldDemoPostIds !== []) {
                DB::table('category_post')->whereIn('post_id', $oldDemoPostIds)->delete();
                DB::table('posts')->whereIn('id', $oldDemoPostIds)->delete();
            }

            // Legacy cleanup (title had the demo prefix)
            $this->command?->info('PostSeeder: removing legacy demo posts (title like '.$demoTitlePrefixLegacy.'%)');

            $oldLegacyDemoPostIds = Post::query()
                ->where('title', 'like', $demoTitlePrefixLegacy.'%')
                ->pluck('id')
                ->all();

            if ($oldLegacyDemoPostIds !== []) {
                DB::table('category_post')->whereIn('post_id', $oldLegacyDemoPostIds)->delete();
                DB::table('posts')->whereIn('id', $oldLegacyDemoPostIds)->delete();
            }
        }

        $this->command?->info('PostSeeder: old demo/legacy posts removed');

        $now = now();
        $this->command?->info('PostSeeder: generating posts (Faker)');
        $this->command?->info('PostSeeder: post_tone='.$postTone);

        $faker = Factory::create('en_US');
        $slugs = [];
        $rows = [];

        // Generate coherent, enterprise-realistic demo posts (title/excerpt/content).
        for ($i = 0; $i < 20; $i++) {
            // Title templates that resemble real blog posts. Parameterized by the "tone"
            // via SEED_POST_TONE=mixed|tecnico|ux|marketing.
            $topics = [];
            $concepts = [];
            $techWords = [];
            $verbs = [];
            $templateMode = 'mixed';

            switch ($postTone) {
                case 'tecnico':
                case 'technical':
                    $templateMode = 'tech';
                    $topics = [
                        'editor performance',
                        'route-level validation',
                        'dashboard rendering',
                        'security hardening',
                        'realtime suggestions UX',
                        'pagination stability',
                        'XSS-safe previews',
                        'asset loading',
                    ];
                    $concepts = [
                        'accessibility',
                        'security',
                        'performance',
                        'debouncing',
                        'throttling',
                        'CLS',
                        'cache strategy',
                        'URL validation',
                    ];
                    $techWords = [
                        'React',
                        'TypeScript',
                        'Laravel',
                        'Inertia.js',
                        'Tiptap',
                        'Radix UI',
                        'TailwindCSS',
                        'Vite',
                    ];
                    $verbs = ['secure', 'optimize', 'benchmark', 'measure', 'refactor', 'harden', 'streamline'];
                    break;
                case 'ux':
                case 'product':
                case 'ux_ui':
                    $templateMode = 'ux';
                    $topics = [
                        'command palettes',
                        'post editors',
                        'mobile navigation',
                        'focus management',
                        'loading UX',
                        'preview modals',
                        'toolbar interactions',
                        'error states',
                    ];
                    $concepts = [
                        'keyboard navigation',
                        'focus restoration',
                        'screen reader announcements',
                        'layout shift prevention',
                        'accessible names',
                        'progress feedback',
                        'empty states',
                        'error messaging',
                    ];
                    $techWords = [
                        'Radix UI',
                        'Tiptap',
                        'TailwindCSS',
                        'React',
                        'aria-live',
                        'focus trap',
                    ];
                    $verbs = ['design', 'improve', 'polish', 'stabilize', 'unblock', 'refine', 'coordinate'];
                    break;
                case 'marketing':
                case 'growth':
                    $templateMode = 'mkt';
                    $topics = [
                        'public blog filtering',
                        'category pages',
                        'onboarding flows',
                        'editorial publishing',
                        'content discovery',
                        'newsletter signups',
                        'search intent',
                        'conversion moments',
                    ];
                    $concepts = [
                        'clarity',
                        'trust',
                        'value',
                        'engagement',
                        'relevance',
                        'consistency',
                        'social proof',
                        'storytelling',
                    ];
                    $techWords = [
                        'design system',
                        'UX copy',
                        'information architecture',
                        'component consistency',
                        'performance budget',
                    ];
                    $verbs = ['ship', 'grow', 'optimize', 'improve', 'refine', 'communicate', 'position'];
                    break;
                case 'mixed':
                default:
                    $templateMode = 'mixed';
                    $topics = [
                        'command palettes',
                        'post dashboards',
                        'mobile navigation',
                        'editor toolbars',
                        'image upload pipelines',
                        'public blog filtering',
                        'preview modals',
                        'loading UX',
                    ];
                    $concepts = [
                        'accessibility',
                        'security',
                        'performance',
                        'UX polish',
                        'state management',
                        'rendering stability',
                        'debouncing',
                        'keyboard navigation',
                    ];
                    $techWords = [
                        'React',
                        'TypeScript',
                        'Laravel',
                        'Inertia.js',
                        'Tiptap',
                        'Radix UI',
                        'TailwindCSS',
                        'Vite',
                    ];
                    $verbs = ['optimize', 'secure', 'refactor', 'improve', 'design', 'evaluate', 'stabilize'];
                    break;
            }

            $topic = $faker->randomElement($topics);
            $concept = $faker->randomElement($concepts);
            $techWord = $faker->randomElement($techWords);
            $verb = $faker->randomElement($verbs);

            $templateChoice = $faker->numberBetween(1, 5);
            $titleCore = match ($templateMode.':'.$templateChoice) {
                'tech:1' => "A Practical Guide to {$concept} in {$topic}",
                'tech:2' => "Why {$concept} Matters for {$topic}",
                'tech:3' => "Designing {$topic} with {$techWord}: Patterns & Trade-offs",
                'tech:4' => "Common Pitfalls When You {$verb} {$topic}",
                'tech:5' => "From Basics to Production: {$concept} Techniques for {$topic}",

                'ux:1' => "A Practical Guide to {$concept} for {$topic}",
                'ux:2' => "Why {$concept} Matters in {$topic}",
                'ux:3' => "Designing {$topic} with {$techWord}: UX Patterns & Details",
                'ux:4' => "Common Pitfalls When You {$verb} {$topic}",
                'ux:5' => "From Basics to Production: {$concept} Improvements for {$topic}",

                'mkt:1' => "A Practical Guide to {$concept} that Improves {$topic}",
                'mkt:2' => "Why {$concept} Drives Better {$topic}",
                'mkt:3' => "Designing {$topic}: {$concept} Lessons from {$techWord}",
                'mkt:4' => "Common Pitfalls When You {$verb} {$topic} with {$concept}",
                'mkt:5' => "From Basics to Production: {$concept} Strategies for {$topic}",

                // mixed:
                default => match ($templateChoice) {
                    1 => "A Practical Guide to {$concept} in {$topic}",
                    2 => "Why {$concept} Matters for {$topic}",
                    3 => "Designing {$topic} with {$techWord}: Patterns & Trade-offs",
                    4 => "Common Pitfalls When You {$verb} {$topic}",
                    default => "From Basics to Production: {$concept} Techniques for {$topic}",
                },
            };

            // Title stays realistic: no internal demo prefix.
            $title = $titleCore.'.';

            $baseSlug = Str::slug($title);
            $slug = $demoSlugPrefix.$baseSlug.'-'.Str::lower(Str::random(6));
            // In case of collision (unlikely, but `slug` is `unique`)
            while (Post::query()->where('slug', $slug)->exists()) {
                $slug = $demoSlugPrefix.$baseSlug.'-'.Str::lower(Str::random(6));
            }

            $paragraphCount = rand(3, 6);
            $paragraphs = [];
            for ($p = 0; $p < $paragraphCount; $p++) {
                // `paragraph()` already returns coherent multi-sentence text.
                $paragraphs[] = trim((string) $faker->paragraph(3));
            }

            // Join into simple HTML for compatibility with the frontend preview.
            $formattedContent = '<p>'.implode('</p><p>', array_map(static fn (string $t): string => $t, $paragraphs)).'</p>';
            // Sanitize because we insert via query-builder (bypasses model hooks).
            $formattedContent = $purifier->purify($formattedContent);

            $excerpt = (string) $faker->sentence(16);
            $excerpt = rtrim($excerpt, '.');
            // Sanitize for consistency.
            // Note: the purifier with AutoParagraph=true wraps the result in `<p>...</p>`.
            // The frontend renders `excerpt` as plain text `{post.excerpt}`,
            // so we remove any HTML tags to avoid showing `<p>` literally.
            $excerpt = strip_tags($purifier->purify($excerpt));
            $published = $faker->boolean(75);
            $publishedAt = $published ? $faker->dateTimeBetween('-1 year', 'now') : null;

            $tags = $faker->words(3);

            $featured = $published && $faker->boolean(25);
            $viewsCount = $published ? $faker->numberBetween(50, 5000) : $faker->numberBetween(0, 100);

            $slugs[] = $slug;
            $rows[] = [
                'title' => $title,
                'slug' => $slug,
                'content' => $formattedContent,
                'excerpt' => $excerpt,
                'published' => $published,
                'published_at' => $publishedAt instanceof \DateTimeInterface
                    ? $publishedAt->format('Y-m-d H:i:s')
                    : null,
                'user_id' => $demoUsers !== [] ? $demoUsers[array_rand($demoUsers)] : $fallbackUserId,
                'tags' => json_encode($tags),
                'views_count' => $viewsCount,
                'featured' => $featured,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->command?->info('PostSeeder: prepared rows (count='.count($rows).')');

        DB::table('posts')->insert($rows);
        $this->command?->info('PostSeeder: inserted posts');

        $inserted = Post::query()
            ->select(['id', 'slug'])
            ->whereIn('slug', $slugs)
            ->get();

        /** @var array<string,int> $idBySlug */
        $idBySlug = $inserted->pluck('id', 'slug')->all();

        $pivotRows = [];
        foreach ($slugs as $slug) {
            $postId = $idBySlug[$slug] ?? null;
            if ($postId === null) {
                continue;
            }

            $take = min($categories->count(), rand(1, 3));
            $randomCategories = $categories->shuffle()->take($take);

            foreach ($randomCategories as $category) {
                $pivotRows[] = [
                    'category_id' => $category->id,
                    'post_id' => $postId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        $this->command?->info('PostSeeder: pivotRows='.count($pivotRows));

        if ($pivotRows !== []) {
            DB::table('category_post')->insert($pivotRows);
        }

        $this->command?->info('PostSeeder: done');

        $this->clearDemoCache();
        $this->command?->info('PostSeeder: demo cache cleared');
    }
}
