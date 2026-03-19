import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    PostsFilters,
    PostsListSection,
} from '@modules/posts/components/PostsIndex/PostsFilters';
import { usePostsIndexPage } from '@modules/posts/hooks/use-posts-index-page';
import type { PostsIndexProps } from '@modules/posts/types/posts-index-props';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Posts',
        href: '/posts',
    },
];

export default function PostsIndex({
    posts,
    categories,
    filters,
}: PostsIndexProps) {
    const viewModel = usePostsIndexPage({ posts, categories, filters });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Manage all your posts ({posts.total} total)
                    </p>
                </div>

                <PostsFilters
                    categories={viewModel.categories}
                    data={viewModel.data}
                    setData={viewModel.setData}
                    filtersOpen={viewModel.filtersOpen}
                    setFiltersOpen={viewModel.setFiltersOpen}
                    savePresetDialog={viewModel.savePresetDialog}
                    setSavePresetDialog={viewModel.setSavePresetDialog}
                    presetName={viewModel.presetName}
                    setPresetName={viewModel.setPresetName}
                    presets={viewModel.presets}
                    handleFilter={viewModel.handleFilter}
                    handleSavePreset={viewModel.handleSavePreset}
                    handleApplyPreset={viewModel.handleApplyPreset}
                    deletePreset={() => {}}
                />

                <PostsListSection
                    posts={viewModel.posts}
                    filters={{
                        search: viewModel.data.search,
                        category: viewModel.data.category,
                        published: viewModel.data.published,
                    }}
                    onDeleteClick={viewModel.handleDeleteClick}
                />
            </div>

            <ConfirmDialog
                open={viewModel.deleteDialog.open}
                onOpenChange={(open) =>
                    viewModel.setDeleteDialog({
                        ...viewModel.deleteDialog,
                        open,
                    })
                }
                onConfirm={viewModel.handleDeleteConfirm}
                title="Delete post?"
                description="This action cannot be undone. The post will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                preview={
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">
                            {viewModel.deleteDialog.postTitle}
                        </p>
                        <Badge variant="outline" className="text-xs">
                            Will be permanently deleted
                        </Badge>
                    </div>
                }
            />
        </AppLayout>
    );
}
