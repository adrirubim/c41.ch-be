<?php

declare(strict_types=1);

namespace App\Domain\Post\DTO;

readonly class PostEditorialSuggestionInputData
{
    /**
     * @param  array<int, string>  $tags
     */
    public function __construct(
        public string $title,
        public string $content,
        public string $excerpt,
        public array $tags,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            title: self::toString($validated['title'] ?? null),
            content: self::toString($validated['content'] ?? null),
            excerpt: self::toString($validated['excerpt'] ?? null),
            tags: self::toStringList($validated['tags'] ?? []),
        );
    }

    /**
     * @return array{title: string, content: string, excerpt: string, tags: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'tags' => $this->tags,
        ];
    }

    private static function toString(mixed $value): string
    {
        if (! is_string($value)) {
            return '';
        }

        return trim($value);
    }

    /**
     * @return list<string>
     */
    private static function toStringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $normalized = [];
        foreach ($value as $item) {
            if (! is_string($item)) {
                continue;
            }

            $trimmed = trim($item);
            if ($trimmed !== '') {
                $normalized[] = $trimmed;
            }
        }

        return array_values(array_unique($normalized));
    }
}
