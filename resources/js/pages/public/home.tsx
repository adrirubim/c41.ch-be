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
import { ArrowRight, Calendar, Eye, Star, Tag, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    published_at: string;
    views_count: number;
    featured: boolean;
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

interface Category {
    id: number;
    name: string;
    slug: string;
    color?: string;
    posts_count: number;
}

interface HomeProps {
    featuredPosts: Post[];
    recentPosts: Post[];
    categories: Category[];
    stats: {
        totalPosts: number;
        totalCategories: number;
        totalViews: number;
    };
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Home({
    featuredPosts,
    recentPosts,
    categories,
    stats,
}: HomeProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Home - C41.ch Blog">
                <meta
                    name="description"
                    content="Discover amazing blog posts about technology, design, marketing, development, and business."
                />
            </Head>

            <div className="relative flex min-h-screen flex-col bg-background">
                {/* Hybrid Elegant Fluid Background */}
                <div className="neon-background">
                    <div className="neon-orb neon-orb-1"></div>
                    <div className="neon-orb neon-orb-2"></div>
                    <div className="neon-orb neon-orb-3"></div>
                    <div className="neon-orb neon-orb-4"></div>
                    <div className="neon-shape neon-shape-1"></div>
                    <div className="neon-shape neon-shape-2"></div>
                    <div className="neon-shape neon-shape-3"></div>
                    <div className="neon-shape neon-shape-4"></div>
                    <div className="neon-shape neon-shape-5"></div>
                    <div className="neon-shape neon-shape-6"></div>
                </div>
                <div className="neon-overlay"></div>

                <div className="relative z-10 flex min-h-screen flex-col">
                    <PublicHeader />

                    <main className="flex-1">
                        {/* Hero Section */}
                        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background/80 to-primary/5 py-20 backdrop-blur-sm md:py-32">
                            <div className="container mx-auto px-4 md:max-w-7xl">
                                <div className="mx-auto max-w-3xl text-center">
                                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                        Welcome to{' '}
                                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                            C41.ch Blog
                                        </span>
                                    </h1>
                                    <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
                                        Discover amazing content about
                                        technology, design, marketing,
                                        development, and business. Join our
                                        community of readers and writers.
                                    </p>
                                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                        <Link href="/blog">
                                            <Button
                                                size="lg"
                                                className="w-full sm:w-auto"
                                            >
                                                Explore Blog
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href="/categories">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                            >
                                                Browse Categories
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Stats Section */}
                        <section className="border-b bg-muted/30 py-12">
                            <div className="container mx-auto px-4 md:max-w-7xl">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Total Posts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">
                                                {stats.totalPosts}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Published articles
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Categories
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">
                                                {stats.totalCategories}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Topics covered
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Total Views
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">
                                                {stats.totalViews.toLocaleString()}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Page views
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Featured Posts Section */}
                        {featuredPosts.length > 0 && (
                            <section className="py-16 md:py-24">
                                <div className="container mx-auto px-4 md:max-w-7xl">
                                    <div className="mb-12 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                Featured Posts
                                            </h2>
                                            <p className="mt-2 text-muted-foreground">
                                                Handpicked articles worth
                                                reading
                                            </p>
                                        </div>
                                        <Link href="/blog?featured=true">
                                            <Button variant="ghost">
                                                View All
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {featuredPosts.map((post) => (
                                            <Card
                                                key={post.id}
                                                className="group transition-shadow hover:shadow-lg"
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                                                            <Link
                                                                href={`/blog/${post.slug}`}
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        </CardTitle>
                                                        <Star className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt ||
                                                            'No excerpt available'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                                        {post.categories.map(
                                                            (category) => (
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
                                                            ),
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-4 w-4" />
                                                                {post.user.name}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(
                                                                    post.published_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-4 w-4" />
                                                            {post.views_count}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Categories Section */}
                        {categories.length > 0 && (
                            <section className="border-t bg-muted/30 py-16 md:py-24">
                                <div className="container mx-auto px-4 md:max-w-7xl">
                                    <div className="mb-12 text-center">
                                        <h2 className="text-3xl font-bold tracking-tight">
                                            Explore Categories
                                        </h2>
                                        <p className="mt-2 text-muted-foreground">
                                            Discover content by topic
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/categories/${category.slug}`}
                                            >
                                                <Card className="group transition-all hover:scale-105 hover:shadow-lg">
                                                    <CardHeader>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                                style={{
                                                                    backgroundColor:
                                                                        category.color
                                                                            ? `${category.color}20`
                                                                            : undefined,
                                                                }}
                                                            >
                                                                <Tag
                                                                    className="h-6 w-6"
                                                                    style={{
                                                                        color:
                                                                            category.color ||
                                                                            undefined,
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <CardTitle className="text-lg transition-colors group-hover:text-primary">
                                                                    {
                                                                        category.name
                                                                    }
                                                                </CardTitle>
                                                                <CardDescription>
                                                                    {
                                                                        category.posts_count
                                                                    }{' '}
                                                                    {category.posts_count ===
                                                                    1
                                                                        ? 'post'
                                                                        : 'posts'}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Recent Posts Section */}
                        {recentPosts.length > 0 && (
                            <section className="py-16 md:py-24">
                                <div className="container mx-auto px-4 md:max-w-7xl">
                                    <div className="mb-12 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                Recent Posts
                                            </h2>
                                            <p className="mt-2 text-muted-foreground">
                                                Latest articles from our blog
                                            </p>
                                        </div>
                                        <Link href="/blog">
                                            <Button variant="ghost">
                                                View All
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {recentPosts.map((post) => (
                                            <Card
                                                key={post.id}
                                                className="group transition-shadow hover:shadow-lg"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                                                        <Link
                                                            href={`/blog/${post.slug}`}
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt ||
                                                            'No excerpt available'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                                        {post.categories
                                                            .slice(0, 2)
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
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-4 w-4" />
                                                                {post.user.name}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(
                                                                    post.published_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-4 w-4" />
                                                            {post.views_count}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* CTA Section */}
                        <section className="border-t bg-gradient-to-br from-primary/10 via-background to-primary/10 py-16 md:py-24">
                            <div className="container mx-auto px-4 md:max-w-7xl">
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        Ready to explore more?
                                    </h2>
                                    <p className="mt-4 text-lg text-muted-foreground">
                                        Browse our complete collection of
                                        articles and discover something new.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                        <Link href="/blog">
                                            <Button size="lg">
                                                View All Posts
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    {/* Footer */}
                    <footer className="relative z-10 border-t bg-muted/30 py-12 backdrop-blur-sm">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        C41.ch Blog
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        A modern blog platform for sharing
                                        knowledge and ideas.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Quick Links
                                    </h3>
                                    <ul className="space-y-2 text-sm">
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
                                    &copy; 2026 Adrián Morillas Pérez. All
                                    rights reserved.
                                </p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
