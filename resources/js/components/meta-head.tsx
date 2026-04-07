import { Head } from '@inertiajs/react';

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export interface MetaHeadProps {
    title: string;
    description?: string;
    canonicalUrl?: string;
    og?: {
        type?: string;
        title?: string;
        description?: string;
        image?: string;
        url?: string;
    };
    twitter?: {
        card?: 'summary' | 'summary_large_image';
        title?: string;
        description?: string;
        image?: string;
    };
    jsonLd?: JsonLd;
}

export function MetaHead({
    title,
    description,
    canonicalUrl,
    og,
    twitter,
    jsonLd,
}: MetaHeadProps) {
    const ogTitle = og?.title ?? title;
    const ogDescription = og?.description ?? description;
    const ogType = og?.type ?? 'website';

    const twitterTitle = twitter?.title ?? title;
    const twitterDescription = twitter?.description ?? description;
    const twitterCard = twitter?.card ?? 'summary_large_image';

    const jsonLdString =
        jsonLd !== undefined ? JSON.stringify(jsonLd) : undefined;

    return (
        <Head title={title}>
            {typeof description === 'string' && description.trim() !== '' ? (
                <meta name="description" content={description} />
            ) : null}

            {typeof canonicalUrl === 'string' && canonicalUrl.trim() !== '' ? (
                <link rel="canonical" href={canonicalUrl} />
            ) : null}

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle} />
            {typeof ogDescription === 'string' &&
            ogDescription.trim() !== '' ? (
                <meta property="og:description" content={ogDescription} />
            ) : null}
            <meta property="og:type" content={ogType} />
            {typeof og?.url === 'string' && og.url.trim() !== '' ? (
                <meta property="og:url" content={og.url} />
            ) : null}
            {typeof og?.image === 'string' && og.image.trim() !== '' ? (
                <meta property="og:image" content={og.image} />
            ) : null}

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={twitterTitle} />
            {typeof twitterDescription === 'string' &&
            twitterDescription.trim() !== '' ? (
                <meta name="twitter:description" content={twitterDescription} />
            ) : null}
            {typeof twitter?.image === 'string' &&
            twitter.image.trim() !== '' ? (
                <meta name="twitter:image" content={twitter.image} />
            ) : null}

            {/* JSON-LD */}
            {typeof jsonLdString === 'string' ? (
                <script type="application/ld+json">{jsonLdString}</script>
            ) : null}
        </Head>
    );
}
