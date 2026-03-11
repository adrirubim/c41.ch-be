import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DashboardCharts } from '@modules/dashboard/components/DashboardCharts';
import { DashboardPostsLists } from '@modules/dashboard/components/DashboardPostsLists';
import { DashboardSecondaryStats } from '@modules/dashboard/components/DashboardSecondaryStats';
import { DashboardStatsGrid } from '@modules/dashboard/components/DashboardStatsGrid';
import { useDashboardPage } from '@modules/dashboard/hooks/use-dashboard-page';
import type { DashboardProps } from '@modules/dashboard/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

export default function Dashboard({
    stats,
    recentPosts,
    popularPosts,
    categoriesDistribution,
    lastPublishedPost,
}: DashboardProps) {
    const viewModel = useDashboardPage({
        stats,
        recentPosts,
        popularPosts,
        categoriesDistribution,
        lastPublishedPost,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Overview of your content
                    </p>
                </div>

                <DashboardStatsGrid stats={viewModel.stats} />
                <DashboardSecondaryStats
                    stats={viewModel.stats}
                    lastPublishedPost={viewModel.lastPublishedPost}
                />
                <DashboardCharts
                    stats={viewModel.stats}
                    categoriesDistribution={viewModel.categoriesDistribution}
                />
                <DashboardPostsLists
                    popularPosts={viewModel.popularPosts}
                    recentPosts={viewModel.recentPosts}
                />
            </div>
        </AppLayout>
    );
}
