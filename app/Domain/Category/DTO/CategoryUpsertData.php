<?php

declare(strict_types=1);

namespace App\Domain\Category\DTO;

readonly class CategoryUpsertData
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            name: trim((string) ($validated['name'] ?? '')),
            slug: trim((string) ($validated['slug'] ?? '')),
            description: self::toNullableString($validated['description'] ?? null),
            color: self::toNullableString($validated['color'] ?? null),
        );
    }

    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description,
        public ?string $color,
    ) {}

    /**
     * @return array{name:string,slug:string,description:?string,color:?string}
     */
    public function toPersistenceArray(): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'color' => $this->color,
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
}
