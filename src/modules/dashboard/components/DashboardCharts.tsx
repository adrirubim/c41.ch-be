import { BarChart, PieChart } from '@/components/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategoryDistribution, DashboardStats } from '@modules/dashboard/types';
import { BarChart3 } from 'lucide-react';

interface DashboardChartsProps {
    stats: DashboardStats;
    categoriesDistribution: CategoryDistribution[];
}

export function DashboardCharts({
    stats,
    categoriesDistribution,
}: DashboardChartsProps) {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Category Distribution
                    </CardTitle>
                    <CardDescription>Posts grouped by category</CardDescription>
                </CardHeader>
                <CardContent>
                    {categoriesDistribution.length > 0 ? (
                        <BarChart
                            data={categoriesDistribution.map((category) => ({
                                label: category.name,
                                value: category.posts_count,
                                color:
                                    category.color !== null &&
                                    category.color !== undefined &&
                                    category.color !== ''
                                        ? category.color
                                        : '#6B7280',
                            }))}
                            maxValue={stats.totalPosts}
                        />
                    ) : (
                        <p className="py-4 text-center text-muted-foreground">
                            No categories yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Post Status
                    </CardTitle>
                    <CardDescription>Published vs Drafts</CardDescription>
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
                                    value: stats.totalPosts - stats.publishedPosts,
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
    );
}

