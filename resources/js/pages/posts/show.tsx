import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Eye, Star, User } from 'lucide-react';

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

interface Post {
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

interface PostsShowProps {
    post: Post;
}

export default function PostsShow({ post }: PostsShowProps) {
    if (!post) {
        return null;
    }

    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const postUrl = `${appUrl}/posts/${post.id}`;

    // Ensure all values are valid strings (never null or undefined)
    const safeTitle = String(post.title || 'Post');
    const safeExcerpt = post.excerpt ? String(post.excerpt) : '';
    const safeContent = post.content ? String(post.content) : '';
    const cleanContent = safeContent
        ? safeContent
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .substring(0, 160)
        : '';
    const description = safeExcerpt || cleanContent || '';

    const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];
    const keywords = tags.length > 0 ? tags.join(', ') : '';
    const authorName = post.user?.name ? String(post.user.name) : '';
    const appName = String(import.meta.env.VITE_APP_NAME || 'C41.ch');

    // Prepare all values for meta tags
    const metaDescription = description || '';
    const metaKeywords = keywords || '';
    const metaAuthor = authorName || '';
    const metaPublishedAt = post.published_at
        ? new Date(post.published_at).toISOString()
        : '';
    const metaSection =
        post.categories &&
        Array.isArray(post.categories) &&
        post.categories.length > 0 &&
        post.categories[0]?.name
            ? String(post.categories[0].name)
            : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>{`${safeTitle} - ${appName}`}</title>

                {metaDescription ? (
                    <meta name="description" content={metaDescription} />
                ) : null}
                {metaKeywords ? (
                    <meta name="keywords" content={metaKeywords} />
                ) : null}
                {metaAuthor ? (
                    <meta name="author" content={metaAuthor} />
                ) : null}

                {/* Open Graph */}
                <meta property="og:title" content={safeTitle} />
                {metaDescription ? (
                    <meta property="og:description" content={metaDescription} />
                ) : null}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={postUrl} />
                {metaPublishedAt ? (
                    <meta
                        property="article:published_time"
                        content={metaPublishedAt}
                    />
                ) : null}
                {metaSection ? (
                    <meta property="article:section" content={metaSection} />
                ) : null}

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={safeTitle} />
                {metaDescription ? (
                    <meta
                        name="twitter:description"
                        content={metaDescription}
                    />
                ) : null}

                {/* Canonical URL */}
                <link rel="canonical" href={postUrl} />
            </Head>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{post.title}</h1>
                        <p className="text-muted-foreground">Post details</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/posts/${post.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Link href="/posts">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {post.title}
                                            {post.featured && (
                                                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {post.excerpt || 'No excerpt'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            post.content || '<p>No content</p>',
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Author:
                                    </span>
                                    <span className="font-medium">
                                        {post.user.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Created:
                                    </span>
                                    <span className="font-medium">
                                        {new Date(
                                            post.created_at,
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                {post.published_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            Published:
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                post.published_at,
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Views:
                                    </span>
                                    <span className="font-medium">
                                        {post.views_count.toLocaleString()}
                                    </span>
                                </div>

                                <div className="border-t pt-2">
                                    <span className="mb-2 block text-sm text-muted-foreground">
                                        Status:
                                    </span>
                                    {post.published ? (
                                        <Badge
                                            variant="outline"
                                            className="border-green-500/20 bg-green-500/10 text-green-600"
                                        >
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Draft</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {post.categories.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Categories</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {post.categories.map((category) => (
                                            <Badge
                                                key={category.id}
                                                variant="outline"
                                                className={
                                                    category.color
                                                        ? 'font-medium'
                                                        : ''
                                                }
                                                style={
                                                    category.color
                                                        ? {
                                                              borderColor:
                                                                  category.color,
                                                              color: category.color,
                                                              backgroundColor: `${category.color}15`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
