<?php

declare(strict_types=1);

namespace App\Infrastructure\Eloquent\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class Fillable
{
    /**
     * @param  list<string>  $fields
     */
    public function __construct(public array $fields) {}
}
