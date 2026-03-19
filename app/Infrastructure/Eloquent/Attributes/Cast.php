<?php

declare(strict_types=1);

namespace App\Infrastructure\Eloquent\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class Cast
{
    /**
     * @param  array<string, string>  $map
     */
    public function __construct(public array $map) {}
}
