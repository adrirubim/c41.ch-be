<?php

declare(strict_types=1);

namespace App\Domain\Post\DTO;

readonly class PostEditorialSuggestionData
{
    /**
     * @param  array<int, string>  $tags
     */
    public function __construct(
        public string $excerpt,
        public array $tags,
    ) {}

    /**
     * @return array{excerpt: string, tags: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'excerpt' => $this->excerpt,
            'tags' => $this->tags,
        ];
    }
}
