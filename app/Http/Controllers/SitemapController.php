<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Genera el sitemap XML
     */
    public function index(): Response
    {
        $posts = Post::where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->withoutTrashed()
            ->orderBy('published_at', 'desc')
            ->get(['id', 'slug', 'updated_at', 'published_at']);

        $categories = Category::withoutTrashed()
            ->get(['id', 'slug', 'updated_at']);

        $baseUrl = config('app.url');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        // Home page
        $xml .= '  <url>'."\n";
        $xml .= '    <loc>'.htmlspecialchars($baseUrl).'</loc>'."\n";
        $xml .= '    <lastmod>'.now()->toAtomString().'</lastmod>'."\n";
        $xml .= '    <changefreq>daily</changefreq>'."\n";
        $xml .= '    <priority>1.0</priority>'."\n";
        $xml .= '  </url>'."\n";

        // Posts publicados
        foreach ($posts as $post) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.htmlspecialchars($baseUrl.'/posts/'.$post->slug).'</loc>'."\n";
            $xml .= '    <lastmod>'.$post->updated_at->toAtomString().'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.8</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        // Categories
        foreach ($categories as $category) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.htmlspecialchars($baseUrl.'/categories/'.$category->slug).'</loc>'."\n";
            $xml .= '    <lastmod>'.$category->updated_at->toAtomString().'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.6</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8');
    }
}
