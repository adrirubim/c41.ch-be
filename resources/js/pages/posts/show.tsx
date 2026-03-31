import AppLayout from '#app/layouts/app-layout';
import { type BreadcrumbItem } from '#app/types';
import { Head } from '@inertiajs/react';
import { PostsShowLayout } from '@modules/posts/components/PostsShow/PostsShowLayout';
import type { PostsShowProps } from '@modules/posts/hooks/use-posts-show-page';
import { usePostsShowPage } from '@modules/posts/hooks/use-posts-show-page';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Posts',
        href: '/posts',
    },
    {
        title: 'View Post',
        href: '/posts/show',
    },
];

export default function PostsShow({ post }: PostsShowProps) {
    const viewModel = usePostsShowPage({ post });

    if (viewModel === null) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>{`${viewModel.safeTitle} - ${viewModel.appName}`}</title>

                {viewModel.metaDescription !== null &&
                viewModel.metaDescription !== undefined &&
                viewModel.metaDescription !== '' ? (
                    <meta
                        name="description"
                        content={viewModel.metaDescription}
                    />
                ) : null}
                {viewModel.metaKeywords !== null &&
                viewModel.metaKeywords !== undefined &&
                viewModel.metaKeywords !== '' ? (
                    <meta name="keywords" content={viewModel.metaKeywords} />
                ) : null}
                {viewModel.metaAuthor !== null &&
                viewModel.metaAuthor !== undefined &&
                viewModel.metaAuthor !== '' ? (
                    <meta name="author" content={viewModel.metaAuthor} />
                ) : null}

                {/* Open Graph */}
                <meta property="og:title" content={viewModel.safeTitle} />
                {viewModel.metaDescription !== null &&
                viewModel.metaDescription !== undefined &&
                viewModel.metaDescription !== '' ? (
                    <meta
                        property="og:description"
                        content={viewModel.metaDescription}
                    />
                ) : null}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={viewModel.postUrl} />
                {viewModel.metaPublishedAt !== null &&
                viewModel.metaPublishedAt !== undefined &&
                viewModel.metaPublishedAt !== '' ? (
                    <meta
                        property="article:published_time"
                        content={viewModel.metaPublishedAt}
                    />
                ) : null}
                {viewModel.metaSection !== null &&
                viewModel.metaSection !== undefined &&
                viewModel.metaSection !== '' ? (
                    <meta
                        property="article:section"
                        content={viewModel.metaSection}
                    />
                ) : null}

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={viewModel.safeTitle} />
                {Boolean(viewModel.metaDescription) === true && (
                    <meta
                        name="twitter:description"
                        content={viewModel.metaDescription}
                    />
                )}

                {/* Canonical URL */}
                <link rel="canonical" href={viewModel.postUrl} />
            </Head>
            <PostsShowLayout post={post} viewModel={viewModel} />
        </AppLayout>
    );
}
