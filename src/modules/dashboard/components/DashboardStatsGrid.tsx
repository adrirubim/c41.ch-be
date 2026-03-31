import { Link } from '#app/components/link';
import { Badge } from '#app/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import type { DashboardStats } from '@modules/dashboard/types';
import {
    ArrowRight,
    CheckCircle,
    Eye,
    FolderOpen,
    Star,
    Users,
} from 'lucide-react';

interface DashboardStatsGridProps {
    stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <Link href="/posts">
                <Card className="transition-smooth card-hover animate-fade-in cursor-pointer hover:bg-accent/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Badge variant="outline">
                                <Eye className="mr-1 h-4 w-4" />
                                Posts
                            </Badge>
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
                        <CardDescription>Total categories</CardDescription>
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
    );
}

