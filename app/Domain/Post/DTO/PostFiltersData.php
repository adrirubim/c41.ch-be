<?php

declare(strict_types=1);

namespace App\Domain\Post\DTO;

readonly class PostFiltersData
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public static function fromRequestData(array $filters, mixed $perPage): self
    {
        $validatedPerPage = (int) $perPage;
        // Allow common frontend/public feed page sizes.
        if (! in_array($validatedPerPage, [6, 12, 15, 25, 50, 100], true)) {
            $validatedPerPage = 15;
        }

        $sortBy = in_array((string) ($filters['sort_by'] ?? ''), ['created_at', 'updated_at', 'title', 'published_at', 'views_count'], true)
            ? (string) $filters['sort_by']
            : 'created_at';

        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return new self(
            search: self::toNullableString($filters['search'] ?? null),
            categoryId: self::toNullableInt($filters['category'] ?? null),
            published: self::toNullableBool($filters['published'] ?? null),
            featured: self::toNullableBool($filters['featured'] ?? null),
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            perPage: $validatedPerPage,
        );
    }

    public function __construct(
        public ?string $search,
        public ?int $categoryId,
        public ?bool $published,
        public ?bool $featured,
        public string $sortBy,
        public string $sortOrder,
        public int $perPage,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toViewArray(): array
    {
        return [
            'search' => $this->search,
            'category' => $this->categoryId,
            'published' => $this->published,
            'featured' => $this->featured,
            'sort_by' => $this->sortBy,
            'sort_order' => $this->sortOrder,
            'per_page' => $this->perPage,
        ];
    }

    private static function toNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function toNullableInt(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (! is_string($value) || trim($value) === '' || ! ctype_digit($value)) {
            return null;
        }

        return (int) $value;
    }

    private static function toNullableBool(mixed $value): ?bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value)) {
            return $value === 1;
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $normalized = strtolower(trim($value));

        return match ($normalized) {
            '1', 'true' => true,
            '0', 'false' => false,
            default => null,
        };
    }
}
