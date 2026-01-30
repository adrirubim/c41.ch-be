<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class HtmlPurifierService
{
    protected HTMLPurifier $purifier;

    public function __construct()
    {
        $config = HTMLPurifier_Config::createDefault();

        // Basic configuration - allows common HTML but blocks scripts
        $config->set('HTML.Allowed', 'p,br,strong,em,u,ul,ol,li,a[href],h1,h2,h3,h4,h5,h6,blockquote,code,pre,img[src|alt|width|height],table,thead,tbody,tr,td,th');
        $config->set('HTML.TargetBlank', true);
        $config->set('AutoFormat.AutoParagraph', true);
        $config->set('AutoFormat.Linkify', true);
        $config->set('AutoFormat.RemoveEmpty', true);

        // Allow image attributes
        $config->set('HTML.AllowedAttributes', 'href,src,alt,width,height,title,class');

        // Security configuration
        $config->set('URI.DisableExternalResources', false);
        $config->set('URI.DisableExternal', false);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);

        $this->purifier = new HTMLPurifier($config);
    }

    /**
     * Sanitiza contenido HTML
     */
    public function purify(string $html): string
    {
        return $this->purifier->purify($html);
    }

    /**
     * Sanitiza contenido HTML con configuración personalizada
     */
    public function purifyWithConfig(string $html, HTMLPurifier_Config $config): string
    {
        $purifier = new HTMLPurifier($config);

        return $purifier->purify($html);
    }
}
