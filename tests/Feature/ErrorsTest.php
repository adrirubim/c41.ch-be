<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErrorsTest extends TestCase
{
    public function test_not_found_route_returns_404_page(): void
    {
        $response = $this->get('/non-existing-page-'.uniqid('', true));

        $response->assertNotFound();
    }
}

