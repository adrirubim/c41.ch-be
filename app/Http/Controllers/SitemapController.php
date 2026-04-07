<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\PostRepository;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(
        private PostRepository $postRepository
    ) {}

    /**
     * Genera el sitemap XML
     */
    public function index(): Response
    {
        $xml = $this->postRepository->getSitemapXmlCached();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8');
    }
}
