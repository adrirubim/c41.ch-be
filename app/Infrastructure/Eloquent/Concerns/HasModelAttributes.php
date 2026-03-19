<?php

declare(strict_types=1);

namespace App\Infrastructure\Eloquent\Concerns;

use App\Infrastructure\Eloquent\Attributes\Cast;
use App\Infrastructure\Eloquent\Attributes\Fillable;
use ReflectionClass;

trait HasModelAttributes
{
    /**
     * Ensure attribute-based configuration is applied when the model is instantiated.
     */
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->initializeHasModelAttributes();
    }

    protected function initializeHasModelAttributes(): void
    {
        $reflection = new ReflectionClass($this);

        $fillableAttributes = $reflection->getAttributes(Fillable::class);
        if ($fillableAttributes !== []) {
            /** @var Fillable $fillable */
            $fillable = $fillableAttributes[0]->newInstance();
            $this->fillable($fillable->fields);
        }

        $castAttributes = $reflection->getAttributes(Cast::class);
        if ($castAttributes !== []) {
            /** @var Cast $cast */
            $cast = $castAttributes[0]->newInstance();
            $this->mergeCasts($cast->map);
        }
    }
}
