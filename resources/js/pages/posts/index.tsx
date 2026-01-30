import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { Link } from '@/components/link';
import { OptimizedPostList } from '@/components/optimized-post-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFilterPresets } from '@/hooks/use-filter-presets';
import AppLayout from '@/layouts/app-layout';
import { withBasePath } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import type { FormDataConvertible } from '@inertiajs/core';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Bookmark,
    BookmarkCheck,
    ChevronDown,
    ChevronUp,
    FileText,
    HelpCircle,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

interface Post {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    featured: boolean;
    views_count: number;
    created_at: string;
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

interface Category {
    id: number;
    name: string;
    slug: string;
    color?: string;
}

interface PostsIndexProps {
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        published?: string;
        featured?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: string | number;
    };
}

export default function PostsIndex({
    posts,
    categories,
    filters,
}: PostsIndexProps) {
    const { data, setData } = useForm({
        search: filters.search || '',
        category: filters.category || 'all',
        published: filters.published || 'all',
        featured: filters.featured || '',
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc',
        per_page: String(filters.per_page || '15'),
    });

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        postId: number | null;
        postTitle: string;
    }>({
        open: false,
        postId: null,
        postTitle: '',
    });

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [savePresetDialog, setSavePresetDialog] = useState(false);
    const [presetName, setPresetName] = useState('');
    const { presets, savePreset, deletePreset, applyPreset } =
        useFilterPresets();

    const handleFilter = useCallback(() => {
        router.get(
            withBasePath('/posts'),
            {
                search: data.search || undefined,
                category:
                    data.category && data.category !== 'all'
                        ? data.category
                        : undefined,
                published:
                    data.published && data.published !== 'all'
                        ? data.published
                        : undefined,
                featured: data.featured || undefined,
                sort_by: data.sort_by,
                sort_order: data.sort_order,
                per_page: data.per_page || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [data]);

    // Real-time search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (data.search !== undefined) {
                handleFilter();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [data.search, handleFilter]);

    const handleDeleteClick = (postId: number, postTitle: string) => {
        setDeleteDialog({
            open: true,
            postId,
            postTitle,
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.postId) {
            router.delete(withBasePath(`/posts/${deleteDialog.postId}`), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialog({
                        open: false,
                        postId: null,
                        postTitle: '',
                    });
                },
            });
        }
    };

    const handleSavePreset = () => {
        if (presetName.trim()) {
            const currentFilters = {
                search: data.search,
                category: data.category,
                published: data.published,
                featured: data.featured,
                sort_by: data.sort_by,
                sort_order: data.sort_order,
                per_page: data.per_page,
            };
            savePreset(presetName.trim(), currentFilters);
            setPresetName('');
            setSavePresetDialog(false);
        }
    };

    const handleApplyPreset = (presetId: string) => {
        const presetFilters = applyPreset(presetId);
        if (presetFilters) {
            const filters = presetFilters as Record<string, string>;
            (Object.keys(filters) as (keyof typeof data)[]).forEach((key) => {
                setData(key, filters[key as string]);
            });
            // Apply filters after a short delay to ensure state is updated
            setTimeout(() => {
                router.get(
                    withBasePath('/posts'),
                    filters as Record<string, FormDataConvertible>,
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            }, 100);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Manage all your posts ({posts.total} total)
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <Collapsible
                        open={filtersOpen}
                        onOpenChange={setFiltersOpen}
                    >
                        <CardHeader className="pb-3">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-auto w-full justify-between p-0 hover:bg-transparent"
                                    aria-expanded={filtersOpen}
                                    aria-controls="filters-content"
                                >
                                    <div className="text-left">
                                        <CardTitle>Filters</CardTitle>
                                        <CardDescription>
                                            Search and filter posts
                                        </CardDescription>
                                    </div>
                                    {filtersOpen ? (
                                        <ChevronUp
                                            className="h-4 w-4 md:hidden"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <ChevronDown
                                            className="h-4 w-4 md:hidden"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent id="filters-content">
                            <CardContent className="pt-0">
                                <div
                                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                                    role="group"
                                    aria-label="Search filters"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="search">Buscar</Label>
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                placeholder="Search by title..."
                                                value={data.search}
                                                onChange={(e) =>
                                                    setData(
                                                        'search',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="category">
                                                Category
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        Filter posts by category
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => {
                                                setData('category', value);
                                                handleFilter();
                                            }}
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All categories
                                                </SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="published">
                                                Status
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        Filter by publication
                                                        status
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Select
                                            value={data.published}
                                            onValueChange={(value) => {
                                                setData('published', value);
                                                handleFilter();
                                            }}
                                        >
                                            <SelectTrigger id="published">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Published
                                                </SelectItem>
                                                <SelectItem value="0">
                                                    Drafts
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="sort_by">
                                                Sort by
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        Choose how to sort the
                                                        posts list
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Select
                                            value={data.sort_by}
                                            onValueChange={(value) => {
                                                setData('sort_by', value);
                                                handleFilter();
                                            }}
                                        >
                                            <SelectTrigger id="sort_by">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at">
                                                    Creation date
                                                </SelectItem>
                                                <SelectItem value="title">
                                                    Title
                                                </SelectItem>
                                                <SelectItem value="views_count">
                                                    Views
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="per_page">
                                                Per page
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        Number of posts to
                                                        display per page
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Select
                                            value={String(data.per_page)}
                                            onValueChange={(value) => {
                                                setData('per_page', value);
                                                handleFilter();
                                            }}
                                        >
                                            <SelectTrigger id="per_page">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">
                                                    15
                                                </SelectItem>
                                                <SelectItem value="25">
                                                    25
                                                </SelectItem>
                                                <SelectItem value="50">
                                                    50
                                                </SelectItem>
                                                <SelectItem value="100">
                                                    100
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Button
                                        onClick={handleFilter}
                                        variant="outline"
                                        className="transition-smooth"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setData((prev) => ({
                                                ...prev,
                                                search: '',
                                                category: 'all',
                                                published: 'all',
                                                featured: '',
                                                sort_by: 'created_at',
                                                sort_order: 'desc',
                                                per_page: '15',
                                            }));
                                            router.get(withBasePath('/posts'));
                                        }}
                                        className="transition-smooth"
                                    >
                                        Clear
                                    </Button>
                                    <Dialog
                                        open={savePresetDialog}
                                        onOpenChange={setSavePresetDialog}
                                    >
                                        <DialogTrigger asChild>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="transition-smooth"
                                                        aria-label="Save filters as preset"
                                                    >
                                                        <Bookmark className="mr-2 h-4 w-4" />
                                                        Save Preset
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        Save current filter
                                                        configuration for quick
                                                        access
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Save Filter Preset
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Save the current filter
                                                    configuration for quick
                                                    access later.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-2">
                                                <Label htmlFor="preset-name">
                                                    Preset name
                                                </Label>
                                                <Input
                                                    id="preset-name"
                                                    value={presetName}
                                                    onChange={(e) =>
                                                        setPresetName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g., Featured posts this month"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSavePreset();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSavePresetDialog(
                                                            false,
                                                        );
                                                        setPresetName('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSavePreset}
                                                    disabled={
                                                        !presetName.trim()
                                                    }
                                                >
                                                    Save
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    {(data.search ||
                                        data.category !== 'all' ||
                                        data.published !== 'all' ||
                                        data.featured) && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto"
                                        >
                                            Active filters
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Saved presets */}
                {presets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Saved Filter Presets
                            </CardTitle>
                            <CardDescription>
                                Quickly apply saved filter configurations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {presets.map((preset) => (
                                    <div
                                        key={preset.id}
                                        className="flex items-center gap-1 rounded-md border bg-secondary/50 px-2 py-1 text-sm"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleApplyPreset(preset.id)
                                            }
                                            className="h-auto p-0 text-xs font-normal hover:bg-transparent"
                                            aria-label={`Apply preset: ${preset.name}`}
                                        >
                                            <BookmarkCheck className="mr-1 h-3 w-3" />
                                            {preset.name}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                deletePreset(preset.id)
                                            }
                                            className="h-4 w-4 p-0 hover:bg-destructive/10"
                                            aria-label={`Delete preset: ${preset.name}`}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Posts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Posts List</CardTitle>
                        <CardDescription>
                            Showing {posts.data.length} of {posts.total} posts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {posts.data.length > 0 ? (
                            <OptimizedPostList
                                posts={posts.data}
                                onDeleteClick={handleDeleteClick}
                            />
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="No posts found"
                                description={
                                    data.search ||
                                    data.category !== 'all' ||
                                    data.published !== 'all'
                                        ? 'Try adjusting the filters to find more results.'
                                        : "Start by creating your first post. It's easy and quick!"
                                }
                                action={{
                                    label: 'Create your first post',
                                    href: '/posts/create',
                                }}
                            />
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {posts.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`transition-smooth flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            aria-label={
                                                link.label.includes('Previous')
                                                    ? 'Previous page'
                                                    : link.label.includes(
                                                            'Next',
                                                        )
                                                      ? 'Next page'
                                                      : `Page ${link.label}`
                                            }
                                            aria-current={
                                                link.active ? 'page' : undefined
                                            }
                                        />
                                    ))}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Page {posts.current_page} of{' '}
                                    {posts.last_page}
                                </div>
                            </div>
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
                title="Delete post?"
                description="This action cannot be undone. The post will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                preview={
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">
                            {deleteDialog.postTitle}
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
