<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Post\DTO\PostEditorialSuggestionData;
use App\Domain\Post\DTO\PostEditorialSuggestionInputData;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class PostEditorialSuggestionService
{
    public function suggest(PostEditorialSuggestionInputData $input): PostEditorialSuggestionData
    {
        $title = $input->title;
        $content = trim(strip_tags($input->content));
        $currentExcerpt = $input->excerpt;
        $existingTags = array_values(array_filter(
            array_map(static fn (string $tag): string => trim($tag), $input->tags),
            static fn (string $tag) => $tag !== ''
        ));

        $fallback = new PostEditorialSuggestionData(
            excerpt: $this->buildExcerpt($title, $content, $currentExcerpt),
            tags: $this->buildTags($title, $content, $existingTags),
        );

        $llmSuggestion = $this->suggestWithLaravelAi($title, $content, $existingTags);
        if ($llmSuggestion === null) {
            return $fallback;
        }

        return new PostEditorialSuggestionData(
            excerpt: $llmSuggestion['excerpt'],
            tags: $this->mergeTags($existingTags, $llmSuggestion['tags']),
        );
    }

    /**
     * @param  array<int, string>  $existingTags
     * @return array{excerpt: string, tags: array<int, string>}|null
     */
    private function suggestWithLaravelAi(string $title, string $content, array $existingTags): ?array
    {
        if (! $this->canUseLlm($content, $title)) {
            return null;
        }

        try {
            $provider = (string) config('services.ai.provider', 'openai');
            $model = (string) config('services.ai.model', 'gpt-4o-mini');
            $prompt = $this->buildPrompt($title, $content, $existingTags);

            $raw = $this->askLaravelAi($provider, $model, $prompt);
            if ($raw === null || trim($raw) === '') {
                return null;
            }

            $decoded = $this->decodeSuggestionJson($raw);
            if ($decoded === null) {
                return null;
            }

            $excerpt = trim($decoded['excerpt']);
            $tags = $decoded['tags'];
            if ($excerpt === '') {
                return null;
            }

            $normalizedTags = array_values(array_filter(
                array_map(static fn ($tag) => trim((string) $tag), $tags),
                static fn (string $tag) => $tag !== ''
            ));

            return [
                'excerpt' => Str::limit($excerpt, 240, '...'),
                'tags' => array_slice($normalizedTags, 0, 10),
            ];
        } catch (Throwable $exception) {
            Log::error('ai_editorial_suggestions_service_failed', [
                'request_id' => app()->bound('request_id') ? app('request_id') : null,
                'error_class' => $exception::class,
                'error_message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function canUseLlm(string $content, string $title): bool
    {
        if (! config('services.ai.enabled', false)) {
            return false;
        }

        if ($content === '' && $title === '') {
            return false;
        }

        $provider = Str::lower((string) config('services.ai.provider', 'openai'));
        if ($provider === 'openai' && empty((string) config('services.ai.openai_api_key', ''))) {
            return false;
        }

        return class_exists('Prism\Prism\Prism') || class_exists('Laravel\Ai\Facades\Ai');
    }

    /**
     * @param  array<int, string>  $existingTags
     */
    private function buildPrompt(string $title, string $content, array $existingTags): string
    {
        $existing = implode(', ', $existingTags);

        return "You are an editorial assistant for a technical blog.\n"
            ."Generate:\n"
            ."- excerpt: concise summary max 240 chars\n"
            ."- tags: 3 to 8 relevant tags\n\n"
            ."Return ONLY valid JSON with this exact shape:\n"
            ."{\"excerpt\":\"...\",\"tags\":[\"Tag1\",\"Tag2\"]}\n\n"
            ."Input title: {$title}\n"
            ."Input content: {$content}\n"
            ."Existing tags: {$existing}";
    }

    private function askLaravelAi(string $provider, string $model, string $prompt): ?string
    {
        unset($provider, $model);

        if (class_exists('Prism\Prism\Prism')) {
            // Typed fallback payload while the concrete AI adapter is being introduced.
            $fallbackExcerpt = Str::limit(trim($prompt), 240, '...');

            $json = json_encode([
                'excerpt' => $fallbackExcerpt,
                'tags' => [],
            ]);

            return is_string($json) ? $json : null;
        }

        return null;
    }

    /**
     * @return array{excerpt: string, tags: array<int, string>}|null
     */
    private function decodeSuggestionJson(string $raw): ?array
    {
        $candidate = trim($raw);
        $decoded = json_decode($candidate, true);
        if (is_array($decoded)) {
            return $this->normalizeDecodedSuggestion($decoded);
        }

        if (preg_match('/\{.*\}/s', $candidate, $matches) === 1) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $this->normalizeDecodedSuggestion($decoded);
            }
        }

        return null;
    }

    /**
     * @param  array<mixed, mixed>  $decoded
     * @return array{excerpt: string, tags: array<int, string>}|null
     */
    private function normalizeDecodedSuggestion(array $decoded): ?array
    {
        $excerptRaw = $decoded['excerpt'] ?? null;
        $tagsRaw = $decoded['tags'] ?? null;

        if (! is_string($excerptRaw) || ! is_array($tagsRaw)) {
            return null;
        }

        $normalizedTags = array_values(array_filter(
            array_map(static fn (mixed $tag): string => trim((string) $tag), $tagsRaw),
            static fn (string $tag): bool => $tag !== ''
        ));

        return [
            'excerpt' => $excerptRaw,
            'tags' => $normalizedTags,
        ];
    }

    /**
     * @param  array<int, string>  $base
     * @param  array<int, string>  $suggested
     * @return array<int, string>
     */
    private function mergeTags(array $base, array $suggested): array
    {
        return array_slice(array_values(array_unique([...$base, ...$suggested])), 0, 10);
    }

    private function buildExcerpt(string $title, string $content, string $fallback): string
    {
        if ($content !== '') {
            return Str::limit(preg_replace('/\s+/', ' ', $content) ?? $content, 240, '...');
        }

        if ($title !== '') {
            return Str::limit($title, 240, '...');
        }

        return Str::limit($fallback, 240, '...');
    }

    /**
     * @param  array<int, string>  $existingTags
     * @return array<int, string>
     */
    private function buildTags(string $title, string $content, array $existingTags): array
    {
        $source = Str::lower($title.' '.$content);
        $normalized = Str::of($source)
            ->replaceMatches('/[^a-z0-9\s-]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim()
            ->value();

        $stopWords = [
            'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'your',
            'have', 'will', 'about', 'post', 'blog', 'content', 'pero', 'para',
            'como', 'esto', 'esta', 'este', 'sobre', 'with', 'without', 'using',
        ];

        $words = collect(explode(' ', $normalized))
            ->filter(static fn (string $word) => strlen($word) >= 4)
            ->reject(static fn (string $word) => in_array($word, $stopWords, true))
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(8)
            ->map(static fn (string $word) => Str::title($word))
            ->values()
            ->all();

        return $this->mergeTags($existingTags, $words);
    }
}
