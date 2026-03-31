import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#app/components/ui/card';
import type { DashboardStats, PostSummary } from '@modules/dashboard/types';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatDate } from '@modules/dashboard/utils/format-date';

interface DashboardSecondaryStatsProps {
    stats: DashboardStats;
    lastPublishedPost: PostSummary | null;
}

export function DashboardSecondaryStats({
    stats,
    lastPublishedPost,
}: DashboardSecondaryStatsProps) {
    const publicationRate =
        stats.totalPosts > 0
            ? Math.round((stats.publishedPosts / stats.totalPosts) * 100)
            : 0;

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        This Month
                    </CardTitle>
                    <CardDescription>Posts created this month</CardDescription>
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
                    <CardDescription>Published posts vs total</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {publicationRate}
                        %
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {stats.publishedPosts} of {stats.totalPosts} posts
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        Last Publication
                    </CardTitle>
                    <CardDescription>Last published post</CardDescription>
                </CardHeader>
                <CardContent>
                    {lastPublishedPost !== null ? (
                        <>
                            <div className="line-clamp-1 text-sm font-semibold">
                                {lastPublishedPost.title}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatDate(
                                    lastPublishedPost.published_at !== null &&
                                        lastPublishedPost.published_at !==
                                            undefined &&
                                        lastPublishedPost.published_at !== ''
                                        ? lastPublishedPost.published_at
                                        : lastPublishedPost.created_at,
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
    );
}

