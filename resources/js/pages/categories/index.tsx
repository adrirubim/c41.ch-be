import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { withBasePath } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Edit, Folder, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    posts_count: number;
}

interface CategoriesIndexProps {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        categoryId: number | null;
        categoryName: string;
    }>({
        open: false,
        categoryId: null,
        categoryName: '',
    });

    const handleDeleteClick = (categoryId: number, categoryName: string) => {
        setDeleteDialog({
            open: true,
            categoryId,
            categoryName,
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.categoryId) {
            router.delete(
                withBasePath(
                    `/dashboard/categories/${deleteDialog.categoryId}`,
                ),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialog({
                            open: false,
                            categoryId: null,
                            categoryName: '',
                        });
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Manage your post categories ({categories.length} total)
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Categories List
                        </CardTitle>
                        <CardDescription>
                            All available categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="transition-smooth card-hover animate-fade-in flex flex-col gap-4 rounded-lg border p-4 hover:bg-accent/50 sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <div
                                                    className="h-4 w-4 flex-shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            category.color ||
                                                            '#6B7280',
                                                    }}
                                                />
                                                <h3 className="font-semibold">
                                                    {category.name}
                                                </h3>
                                            </div>
                                            {category.description && (
                                                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                                    {category.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {category.posts_count}{' '}
                                                    {category.posts_count === 1
                                                        ? 'post'
                                                        : 'posts'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    /{category.slug}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 sm:ml-4 sm:justify-start">
                                            <Link
                                                href={`/dashboard/categories/${category.id}/edit`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    aria-label={`Edit category: ${category.name}`}
                                                >
                                                    <Edit
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        category.id,
                                                        category.name,
                                                    )
                                                }
                                                className="h-9 w-9 text-destructive hover:text-destructive"
                                                aria-label={`Delete category: ${category.name}`}
                                            >
                                                <Trash2
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Folder}
                                title="No categories yet"
                                description="Categories help you organize your posts. Create your first category to get started."
                                action={{
                                    label: 'Create category',
                                    href: '/dashboard/categories/new',
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ ...deleteDialog, open })
                }
                onConfirm={handleDeleteConfirm}
                title="Delete category?"
                description="This action cannot be undone. The category will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                preview={
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">
                            {deleteDialog.categoryName}
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
