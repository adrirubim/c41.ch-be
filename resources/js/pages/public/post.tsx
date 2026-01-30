import { Link } from '@/components/link';
import { PublicHeader } from '@/components/public-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Eye, Star, Tag, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    published_at: string;
    views_count: number;
    featured: boolean;
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

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    published_at: string;
    views_count: number;
    user: {
        id: number;
        name: string;
    };
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        color?: string;
    }>;
}

interface PostProps {
    post: Post;
    relatedPosts: RelatedPost[];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Post({ post, relatedPosts }: PostProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={`${post.title} - C41.ch Blog`}>
                <meta name="description" content={post.excerpt || post.title} />
                <meta property="og:title" content={post.title} />
                <meta
                    property="og:description"
                    content={post.excerpt || post.title}
                />
                <meta property="og:type" content="article" />
            </Head>

            <div className="flex min-h-screen flex-col bg-background">
                <PublicHeader />

                <main className="flex-1">
                    {/* Post Header */}
                    <article className="py-12 md:py-16">
                        <div className="container mx-auto px-4 md:max-w-4xl">
                            <Link href="/blog">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mb-8"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Blog
                                </Button>
                            </Link>

                            <header className="mb-8">
                                <div className="mb-4 flex items-center gap-2">
                                    {post.categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/categories/${category.slug}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                style={{
                                                    backgroundColor:
                                                        category.color
                                                            ? `${category.color}20`
                                                            : undefined,
                                                    borderColor:
                                                        category.color ||
                                                        undefined,
                                                }}
                                                className="transition-opacity hover:opacity-80"
                                            >
                                                {category.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {post.featured && (
                                        <Badge
                                            variant="default"
                                            className="gap-1"
                                        >
                                            <Star className="h-3 w-3" />
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    {post.title}
                                </h1>
                                {post.excerpt && (
                                    <p className="mb-6 text-xl text-muted-foreground">
                                        {post.excerpt}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {post.user.name}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(post.published_at)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        {post.views_count} views
                                    </span>
                                </div>
                            </header>

                            {/* Post Content */}
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: post.content,
                                }}
                            />

                            {/* Categories Footer */}
                            <div className="mt-12 border-t pt-8">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Categories:
                                    </span>
                                    {post.categories.map((category, index) => (
                                        <span key={category.id}>
                                            <Link
                                                href={`/categories/${category.slug}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {category.name}
                                            </Link>
                                            {index <
                                                post.categories.length - 1 && (
                                                <span className="mx-2 text-muted-foreground">
                                                    ,
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <section className="border-t bg-muted/30 py-12 md:py-16">
                            <div className="container mx-auto px-4 md:max-w-7xl">
                                <h2 className="mb-8 text-2xl font-bold">
                                    Related Posts
                                </h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {relatedPosts.map((relatedPost) => (
                                        <Card
                                            key={relatedPost.id}
                                            className="group transition-shadow hover:shadow-lg"
                                        >
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                                                    <Link
                                                        href={`/blog/${relatedPost.slug}`}
                                                    >
                                                        {relatedPost.title}
                                                    </Link>
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {relatedPost.excerpt ||
                                                        'No excerpt available'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                                    {relatedPost.categories
                                                        .slice(0, 1)
                                                        .map((category) => (
                                                            <Link
                                                                key={
                                                                    category.id
                                                                }
                                                                href={`/categories/${category.slug}`}
                                                            >
                                                                <Badge
                                                                    variant="secondary"
                                                                    style={{
                                                                        backgroundColor:
                                                                            category.color
                                                                                ? `${category.color}20`
                                                                                : undefined,
                                                                        borderColor:
                                                                            category.color ||
                                                                            undefined,
                                                                    }}
                                                                    className="transition-opacity hover:opacity-80"
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </Badge>
                                                            </Link>
                                                        ))}
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {relatedPost.user.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        {
                                                            relatedPost.views_count
                                                        }
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/30 py-12">
                    <div className="container mx-auto px-4 md:max-w-7xl">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">
                                    C41.ch Blog
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    A modern blog platform for sharing knowledge
                                    and ideas.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">
                                    Quick Links
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link
                                            href="/"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/blog"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/categories"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Categories
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">
                                    Account
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    {auth?.user ? (
                                        <li>
                                            <Link
                                                href={dashboard()}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                <Link
                                                    href={login()}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    Log in
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href={register()}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    Sign up
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                            <p>
                                &copy; {new Date().getFullYear()} C41.ch Blog.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
