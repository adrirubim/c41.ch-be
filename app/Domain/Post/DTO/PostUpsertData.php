<?php

declare(strict_types=1);

namespace App\Domain\Post\DTO;

use Carbon\CarbonImmutable;

readonly class PostUpsertData
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public static function fromValidated(
        array $validated,
        int $defaultUserId,
        bool $clearPublishedAtWhenUnpublished,
    ): self {
        $published = (bool) ($validated['published'] ?? false);
        $publishedAt = self::toNullableDateTime($validated['published_at'] ?? null);

        if ($published && $publishedAt === null) {
            $publishedAt = CarbonImmutable::now();
        }

        if (! $published && $clearPublishedAtWhenUnpublished) {
            $publishedAt = null;
        }

        return new self(
            title: (string) ($validated['title'] ?? ''),
            slug: (string) ($validated['slug'] ?? ''),
            content: self::toNullableString($validated['content'] ?? null),
            excerpt: self::toNullableString($validated['excerpt'] ?? null),
            published: $published,
            publishedAt: $publishedAt,
            userId: (int) ($validated['user_id'] ?? $defaultUserId),
            category: self::toNullableString($validated['category'] ?? null),
            tags: self::toStringArray($validated['tags'] ?? []),
            featured: (bool) ($validated['featured'] ?? false),
        );
    }

    public function __construct(
        public string $title,
        public string $slug,
        public ?string $content,
        public ?string $excerpt,
        public bool $published,
        public ?CarbonImmutable $publishedAt,
        public int $userId,
        public ?string $category,
        /** @var array<int, string> */
        public array $tags,
        public bool $featured,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toPersistenceArray(): array
    {
        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'published' => $this->published,
            'published_at' => $this->publishedAt?->toDateTimeString(),
            'user_id' => $this->userId,
            'category' => $this->category,
            'tags' => $this->tags,
            'featured' => $this->featured,
        ];
    }

    private static function toNullableDateTime(mixed $value): ?CarbonImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        return CarbonImmutable::parse((string) $value);
    }

    private static function toNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    /**
     * @return array<int, string>
     */
    private static function toStringArray(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $strings = [];
        foreach ($value as $item) {
            if (! is_string($item)) {
                continue;
            }

            $trimmed = trim($item);
            if ($trimmed !== '') {
                $strings[] = $trimmed;
            }
        }

        return array_values(array_unique($strings));
    }
}
