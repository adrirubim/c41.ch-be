<?php

namespace App\Services;

use Illuminate\Support\Str;
use Throwable;

class PostEditorialSuggestionService
{
    /**
     * @param  array{title?: string, content?: string, excerpt?: string, tags?: array<int, string>}  $input
     * @return array{excerpt: string, tags: array<int, string>}
     */
    public function suggest(array $input): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        $content = trim(strip_tags((string) ($input['content'] ?? '')));
        $currentExcerpt = trim((string) ($input['excerpt'] ?? ''));
        $existingTags = array_values(array_filter(
            array_map(static fn ($tag) => trim((string) $tag), $input['tags'] ?? []),
            static fn (string $tag) => $tag !== ''
        ));

        $fallback = [
            'excerpt' => $this->buildExcerpt($title, $content, $currentExcerpt),
            'tags' => $this->buildTags($title, $content, $existingTags),
        ];

        $llmSuggestion = $this->suggestWithLaravelAi($title, $content, $existingTags);
        if ($llmSuggestion === null) {
            return $fallback;
        }

        return [
            'excerpt' => $llmSuggestion['excerpt'],
            'tags' => $this->mergeTags($existingTags, $llmSuggestion['tags']),
        ];
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

            $excerpt = trim((string) ($decoded['excerpt'] ?? ''));
            $tags = $decoded['tags'] ?? [];
            if ($excerpt === '' || ! is_array($tags)) {
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
        } catch (Throwable) {
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
        if ($provider === 'openai' && empty((string) env('OPENAI_API_KEY', ''))) {
            return false;
        }

        return class_exists('Prism\Prism\Prism') || class_exists('Laravel\Ai\Facades\Ai');
    }

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
        // Try Prism API first (dependency installed by laravel/ai).
        if (class_exists('Prism\Prism\Prism')) {
            /** @var class-string $prism */
            $prism = 'Prism\Prism\Prism';
            $builder = $prism::text();
            $builder = $builder->using($provider, $model)->withPrompt($prompt);

            if (method_exists($builder, 'asText')) {
                $result = $builder->asText();

                return is_string($result) ? $result : null;
            }

            if (method_exists($builder, 'generate')) {
                $result = $builder->generate();

                if (is_string($result)) {
                    return $result;
                }

                if (is_object($result) && method_exists($result, 'text')) {
                    $text = $result->text();

                    return is_string($text) ? $text : null;
                }
            }
        }

        // Fallback placeholder for future direct Laravel AI facade usage.
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
            return $decoded;
        }

        if (preg_match('/\{.*\}/s', $candidate, $matches) === 1) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
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
