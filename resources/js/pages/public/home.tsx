import { Link } from '#app/components/link';
import { PublicHeader } from '#app/components/public-header';
import { Badge } from '#app/components/ui/badge';
import { Button } from '#app/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import { dashboard, login, register } from '#app/routes';
import { type SharedData } from '#app/types';
import { MetaHead, type MetaHeadProps } from '#app/components/meta-head';
import { usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Eye,
    FileText,
    LockKeyhole,
    ShieldCheck,
    Star,
    Tag,
    User,
} from 'lucide-react';

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
    seo?: MetaHeadProps;
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
    seo,
}: HomeProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = auth.user !== null;
    const isAdmin = auth.user?.is_admin === true;

    return (
        <>
            <MetaHead
                title={seo?.title ?? 'Home'}
                description={seo?.description}
                canonicalUrl={seo?.canonicalUrl}
                og={seo?.og}
                twitter={seo?.twitter}
                jsonLd={seo?.jsonLd}
            />

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
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1 text-xs text-muted-foreground shadow-sm">
                                        <span className="font-medium text-foreground">
                                            Enterprise-ready
                                        </span>
                                        <span aria-hidden="true">•</span>
                                        <span>Demo content included.</span>
                                    </div>
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
                                                Published articles.
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
                                                Topics covered.
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
                                                Page views.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="relative z-10 py-14 md:py-20">
                            <div className="container mx-auto px-4 md:max-w-7xl">
                                <div className="mx-auto max-w-4xl text-center">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        Built for enterprise-ready demos
                                    </h2>
                                    <p className="mt-3 text-muted-foreground">
                                        Built like production UX: safe previews
                                        and auth-gated access.
                                    </p>
                                </div>

                                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <Card className="bg-background/70 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md border bg-background p-2">
                                                    <LockKeyhole className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <CardTitle className="text-lg">
                                                        Auth-gated access
                                                    </CardTitle>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Blog and categories are
                                                        protected and require
                                                        verified authentication.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    <Card className="bg-background/70 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md border bg-background p-2">
                                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <CardTitle className="text-lg">
                                                        Sanitized previews
                                                    </CardTitle>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Rich text is sanitized
                                                        to keep previews safe,
                                                        consistent, and
                                                        readable.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    <Card className="bg-background/70 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md border bg-background p-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <CardTitle className="text-lg">
                                                        Realistic demo content
                                                    </CardTitle>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Seeded posts use
                                                        realistic titles,
                                                        excerpts, and structured
                                                        metadata.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
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
                                                Validate tone and layout at a
                                                glance.
                                            </p>
                                        </div>
                                        {isAuthenticated ? (
                                            <Link href="/blog?featured=true">
                                                <Button variant="ghost">
                                                    View All
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={login()}>
                                                <Button variant="outline">
                                                    Log in
                                                </Button>
                                            </Link>
                                        )}
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
                                                            {isAuthenticated ? (
                                                                <Link
                                                                    href={`/blog/${post.slug}`}
                                                                >
                                                                    {post.title}
                                                                </Link>
                                                            ) : (
                                                                <span>
                                                                    {post.title}
                                                                </span>
                                                            )}
                                                        </CardTitle>
                                                        <Star className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt !==
                                                            undefined &&
                                                        post.excerpt !== null &&
                                                        post.excerpt !== ''
                                                            ? post.excerpt
                                                            : 'No excerpt available'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                                        {post.categories.map(
                                                            (category) => {
                                                                const badge = (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        style={{
                                                                            backgroundColor:
                                                                                category.color !==
                                                                                    undefined &&
                                                                                category.color !==
                                                                                    null &&
                                                                                category.color !==
                                                                                    ''
                                                                                    ? `${category.color}20`
                                                                                    : undefined,
                                                                            borderColor:
                                                                                category.color !==
                                                                                    undefined &&
                                                                                category.color !==
                                                                                    null &&
                                                                                category.color !==
                                                                                    ''
                                                                                    ? category.color
                                                                                    : undefined,
                                                                        }}
                                                                        className="transition-opacity hover:opacity-80"
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </Badge>
                                                                );

                                                                return isAuthenticated ? (
                                                                    <Link
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        href={`/categories/${category.slug}`}
                                                                    >
                                                                        {badge}
                                                                    </Link>
                                                                ) : (
                                                                    <span
                                                                        key={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {badge}
                                                                    </span>
                                                                );
                                                            },
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
                                            Explore a realistic taxonomy with
                                            real category counts.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                        {categories.map((category) => {
                                            const card = (
                                                <Card className="group transition-all hover:scale-105 hover:shadow-lg">
                                                    <CardHeader>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                                style={{
                                                                    backgroundColor:
                                                                        category.color !==
                                                                            undefined &&
                                                                        category.color !==
                                                                            null &&
                                                                        category.color !==
                                                                            ''
                                                                            ? `${category.color}20`
                                                                            : undefined,
                                                                }}
                                                            >
                                                                <Tag
                                                                    className="h-6 w-6"
                                                                    style={{
                                                                        color:
                                                                            category.color !==
                                                                                undefined &&
                                                                            category.color !==
                                                                                null &&
                                                                            category.color !==
                                                                                ''
                                                                                ? category.color
                                                                                : undefined,
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
                                            );

                                            if (isAuthenticated) {
                                                return (
                                                    <Link
                                                        key={category.id}
                                                        href={`/categories/${category.slug}`}
                                                    >
                                                        {card}
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <div key={category.id}>
                                                    {card}
                                                </div>
                                            );
                                        })}
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
                                                Consistent ordering and reliable
                                                paging.
                                            </p>
                                        </div>
                                        {isAuthenticated ? (
                                            <Link href="/blog">
                                                <Button variant="ghost">
                                                    View All
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={login()}>
                                                <Button variant="outline">
                                                    Log in
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {recentPosts.map((post) => (
                                            <Card
                                                key={post.id}
                                                className="group transition-shadow hover:shadow-lg"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                                                        {isAuthenticated ? (
                                                            <Link
                                                                href={`/blog/${post.slug}`}
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        ) : (
                                                            <span>
                                                                {post.title}
                                                            </span>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt !==
                                                            undefined &&
                                                        post.excerpt !== null &&
                                                        post.excerpt !== ''
                                                            ? post.excerpt
                                                            : 'No excerpt available'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                                        {post.categories
                                                            .slice(0, 2)
                                                            .map((category) => {
                                                                const badge = (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        style={{
                                                                            backgroundColor:
                                                                                category.color !==
                                                                                    undefined &&
                                                                                category.color !==
                                                                                    null &&
                                                                                category.color !==
                                                                                    ''
                                                                                    ? `${category.color}20`
                                                                                    : undefined,
                                                                            borderColor:
                                                                                category.color !==
                                                                                    undefined &&
                                                                                category.color !==
                                                                                    null &&
                                                                                category.color !==
                                                                                    ''
                                                                                    ? category.color
                                                                                    : undefined,
                                                                        }}
                                                                        className="transition-opacity hover:opacity-80"
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </Badge>
                                                                );

                                                                return isAuthenticated ? (
                                                                    <Link
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        href={`/categories/${category.slug}`}
                                                                    >
                                                                        {badge}
                                                                    </Link>
                                                                ) : (
                                                                    <span
                                                                        key={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {badge}
                                                                    </span>
                                                                );
                                                            })}
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
                                        Sign in to browse the blog—only admins
                                        can access the dashboard.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                        {isAuthenticated ? (
                                            <Link href="/blog">
                                                <Button size="lg">
                                                    View All Posts
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={login()}>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                >
                                                    Log in
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
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
                                        {isAuthenticated && (
                                            <>
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
                                            </>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Account
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        {auth?.user !== null &&
                                        auth?.user !== undefined ? (
                                            isAdmin ? (
                                                <li>
                                                    <Link
                                                        href={dashboard()}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                </li>
                                            ) : null
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
