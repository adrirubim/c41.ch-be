import { BarChart, PieChart } from '@/components/charts';
import { EmptyState } from '@/components/empty-state';
import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    FolderOpen,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface Post {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    featured: boolean;
    views_count: number;
    created_at: string;
    published_at?: string | null;
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

interface CategoryDistribution {
    id: number;
    name: string;
    slug: string;
    color: string;
    posts_count: number;
}

interface DashboardProps {
    stats: {
        totalPosts: number;
        publishedPosts: number;
        featuredPosts: number;
        categories: number;
        totalViews: number;
        usersCount: number;
        averageViews: number;
        postsThisMonth: number;
    };
    recentPosts: Post[];
    popularPosts: Post[];
    categoriesDistribution: CategoryDistribution[];
    lastPublishedPost: Post | null;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'A few seconds ago';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Dashboard({
    stats,
    recentPosts,
    popularPosts,
    categoriesDistribution,
    lastPublishedPost,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header with quick action */}
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Overview of your content
                    </p>
                </div>

                {/* Main Statistics */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <Link href="/posts">
                        <Card className="transition-smooth card-hover animate-fade-in cursor-pointer hover:bg-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Total Posts
                                </CardTitle>
                                <CardDescription>All posts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">
                                        {stats.totalPosts}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Published
                            </CardTitle>
                            <CardDescription>Published posts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.publishedPosts}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Featured
                            </CardTitle>
                            <CardDescription>Featured posts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.featuredPosts}
                            </div>
                        </CardContent>
                    </Card>

                    <Link href="/dashboard/categories">
                        <Card className="transition-smooth card-hover animate-fade-in cursor-pointer hover:bg-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5 text-blue-500" />
                                    Categories
                                </CardTitle>
                                <CardDescription>
                                    Total categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">
                                        {stats.categories}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-purple-500" />
                                Views
                            </CardTitle>
                            <CardDescription>Total views</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.totalViews.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Average: {stats.averageViews} per post
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                Users
                            </CardTitle>
                            <CardDescription>Total users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.usersCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Statistics */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                This Month
                            </CardTitle>
                            <CardDescription>
                                Posts created this month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.postsThisMonth}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Publication Rate
                            </CardTitle>
                            <CardDescription>
                                Published posts vs total
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.totalPosts > 0
                                    ? Math.round(
                                          (stats.publishedPosts /
                                              stats.totalPosts) *
                                              100,
                                      )
                                    : 0}
                                %
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.publishedPosts} of {stats.totalPosts}{' '}
                                posts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Last Publication
                            </CardTitle>
                            <CardDescription>
                                Last published post
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lastPublishedPost ? (
                                <>
                                    <div className="line-clamp-1 text-sm font-semibold">
                                        {lastPublishedPost.title}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatDate(
                                            lastPublishedPost.published_at ||
                                                lastPublishedPost.created_at,
                                        )}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No published posts
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Visualization Charts */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* Category Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Category Distribution
                            </CardTitle>
                            <CardDescription>
                                Posts grouped by category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categoriesDistribution.length > 0 ? (
                                <BarChart
                                    data={categoriesDistribution.map(
                                        (category) => ({
                                            label: category.name,
                                            value: category.posts_count,
                                            color: category.color || '#6B7280',
                                        }),
                                    )}
                                    maxValue={stats.totalPosts}
                                />
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    No categories yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Post Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Post Status
                            </CardTitle>
                            <CardDescription>
                                Published vs Drafts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.totalPosts > 0 ? (
                                <PieChart
                                    data={[
                                        {
                                            label: 'Published',
                                            value: stats.publishedPosts,
                                            color: '#22c55e',
                                        },
                                        {
                                            label: 'Drafts',
                                            value:
                                                stats.totalPosts -
                                                stats.publishedPosts,
                                            color: '#6b7280',
                                        },
                                    ]}
                                    size={150}
                                />
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    No posts yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Popular and Recent Posts */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* Popular Posts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                Most Popular Posts
                            </CardTitle>
                            <CardDescription>
                                Top 5 posts by views
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {popularPosts.length > 0 ? (
                                <div className="space-y-3">
                                    {popularPosts.map((post, index) => (
                                        <Link
                                            key={post.id}
                                            href={`/posts/${post.id}`}
                                            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="line-clamp-2 text-sm font-semibold hover:underline">
                                                        {post.title}
                                                    </h3>
                                                    {post.featured && (
                                                        <Star className="mt-0.5 h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        {post.views_count.toLocaleString()}
                                                    </Badge>
                                                    {post.published ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-500/20 bg-green-500/10 text-xs text-green-600"
                                                        >
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </div>
                                                {post.categories.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                                        {post.categories
                                                            .slice(0, 2)
                                                            .map((cat) => (
                                                                <Badge
                                                                    key={cat.id}
                                                                    variant="outline"
                                                                    className={
                                                                        cat.color
                                                                            ? 'text-xs font-medium'
                                                                            : 'text-xs'
                                                                    }
                                                                    style={
                                                                        cat.color
                                                                            ? {
                                                                                  borderColor:
                                                                                      cat.color,
                                                                                  color: cat.color,
                                                                                  backgroundColor: `${cat.color}15`,
                                                                              }
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {cat.name}
                                                                </Badge>
                                                            ))}
                                                        {post.categories
                                                            .length > 2 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                +
                                                                {post.categories
                                                                    .length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-8 text-center text-muted-foreground">
                                    No posts yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Posts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Recent Posts
                            </CardTitle>
                            <CardDescription>
                                Last 5 posts created
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentPosts.length > 0 ? (
                                <div className="space-y-3">
                                    {recentPosts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/posts/${post.id}`}
                                            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-start justify-between gap-2">
                                                    <h3 className="line-clamp-2 text-sm font-semibold hover:underline">
                                                        {post.title}
                                                    </h3>
                                                    {post.featured && (
                                                        <Star className="mt-0.5 h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        By {post.user.name}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDate(
                                                            post.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        {post.views_count}
                                                    </Badge>
                                                    {post.published ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-500/20 bg-green-500/10 text-xs text-green-600"
                                                        >
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </div>
                                                {post.categories.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                                        {post.categories
                                                            .slice(0, 3)
                                                            .map((cat) => (
                                                                <Badge
                                                                    key={cat.id}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    style={{
                                                                        borderColor:
                                                                            cat.color ||
                                                                            undefined,
                                                                        color:
                                                                            cat.color ||
                                                                            undefined,
                                                                    }}
                                                                >
                                                                    {cat.name}
                                                                </Badge>
                                                            ))}
                                                        {post.categories
                                                            .length > 3 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                +
                                                                {post.categories
                                                                    .length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <EmptyState
                                        icon={FileText}
                                        title="No posts yet"
                                        description="Start by creating your first post. It's easy and quick!"
                                        action={{
                                            label: 'Create your first post',
                                            href: '/posts/create',
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
