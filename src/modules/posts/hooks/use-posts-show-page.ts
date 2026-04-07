import type { ServerSanitizedHtml } from '#app/lib/safe-html';
import { postContentHtmlFromServer } from '#app/lib/posts-html';

export interface PostsShowPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    published: boolean;
    featured: boolean;
    views_count: number;
    created_at: string;
    published_at: string | null;
    tags?: string[];
    user: {
        id: number;
        name: string;
        email: string;
    };
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        color?: string;
    }>;
}

export interface PostsShowProps {
    post: PostsShowPost;
}

export interface PostsShowViewModel {
    appName: string;
    postUrl: string;
    safeTitle: string;
    metaDescription: string;
    metaKeywords: string;
    metaAuthor: string;
    metaPublishedAt: string;
    metaSection: string;
    contentHtml: ServerSanitizedHtml;
}

export function usePostsShowPage({ post }: PostsShowProps): PostsShowViewModel | null {
    if (post === null || post === undefined) {
        return null;
    }

    const appUrl =
        typeof window !== 'undefined' && window.location.origin !== undefined
            ? window.location.origin
            : '';
    const postUrl = `${appUrl}/posts/${post.id}`;

    const safeTitle = String(post.title ?? 'Post');
    const safeExcerpt =
        post.excerpt !== undefined && post.excerpt !== null
            ? String(post.excerpt)
            : '';
    const safeContent =
        post.content !== undefined && post.content !== null
            ? String(post.content)
            : '';
    const cleanContent =
        safeContent !== ''
            ? safeContent
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .substring(0, 160)
            : '';
    const description =
        safeExcerpt !== undefined &&
        safeExcerpt !== null &&
        safeExcerpt !== ''
            ? safeExcerpt
            : cleanContent;

    const tags =
        Array.isArray(post.tags) === true
            ? post.tags.filter((tag) => Boolean(tag))
            : [];
    const keywords = tags.length > 0 ? tags.join(', ') : '';

    const authorName =
        post.user !== undefined &&
        post.user !== null &&
        post.user.name !== undefined &&
        post.user.name !== null &&
        post.user.name !== ''
            ? String(post.user.name)
            : '';

    const rawAppName = import.meta.env.VITE_APP_NAME;
    const appName =
        rawAppName !== undefined && rawAppName !== null && rawAppName !== ''
            ? String(rawAppName)
            : 'C41.ch';

    const metaDescription =
        description !== undefined &&
        description !== null &&
        description !== ''
            ? description
            : '';
    const metaKeywords = keywords !== '' ? keywords : '';
    const metaAuthor = authorName !== '' ? authorName : '';
    const metaPublishedAt =
        post.published_at !== undefined &&
        post.published_at !== null &&
        post.published_at !== ''
            ? new Date(post.published_at).toISOString()
            : '';
    const metaSection =
        Array.isArray(post.categories) === true &&
        post.categories.length > 0 &&
        post.categories[0] !== undefined &&
        post.categories[0] !== null &&
        post.categories[0].name !== undefined &&
        post.categories[0].name !== null &&
        post.categories[0].name !== ''
            ? String(post.categories[0].name)
            : '';

    const contentHtml = postContentHtmlFromServer(
        post.content !== null && post.content !== undefined && post.content !== ''
            ? post.content
            : '<p>No content</p>',
    );

    return {
        appName,
        postUrl,
        safeTitle,
        metaDescription,
        metaKeywords,
        metaAuthor,
        metaPublishedAt,
        metaSection,
        contentHtml,
    };
}

