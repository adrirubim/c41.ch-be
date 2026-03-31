import { EmptyState } from '#app/components/empty-state';
import { Link } from '#app/components/link';
import { Badge } from '#app/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import type { PostSummary } from '@modules/dashboard/types';
import { Eye, FileText, Star } from 'lucide-react';
import { formatDate } from '@modules/dashboard/utils/format-date';

interface DashboardPostsListsProps {
    popularPosts: PostSummary[];
    recentPosts: PostSummary[];
}

export function DashboardPostsLists({
    popularPosts,
    recentPosts,
}: DashboardPostsListsProps) {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                            ★
                        </span>
                        Most Popular Posts
                    </CardTitle>
                    <CardDescription>Top 5 posts by views</CardDescription>
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
                                                                cat.color !==
                                                                    null &&
                                                                cat.color !==
                                                                    undefined &&
                                                                cat.color !== ''
                                                                    ? 'text-xs font-medium'
                                                                    : 'text-xs'
                                                            }
                                                            style={
                                                                cat.color !==
                                                                    null &&
                                                                cat.color !==
                                                                    undefined &&
                                                                cat.color !== ''
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
                                                {post.categories.length > 2 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +
                                                        {post.categories.length -
                                                            2}
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                            ⏱
                        </span>
                        Recent Posts
                    </CardTitle>
                    <CardDescription>Last 5 posts created</CardDescription>
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
                                            <span>By {post.user.name}</span>
                                            <span>•</span>
                                            <span>{formatDate(post.created_at)}</span>
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
    );
}

