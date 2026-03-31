import { EmptyState } from '#app/components/empty-state';
import { OptimizedPostList } from '#app/components/optimized-post-list';
import { Badge } from '#app/components/ui/badge';
import { Button } from '#app/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '#app/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '#app/components/ui/dialog';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '#app/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '#app/components/ui/tooltip';
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, FileText, HelpCircle, Search, X } from 'lucide-react';
import type { PostsIndexCategory, PostsIndexPost } from '@modules/posts/types/posts-index-props';

interface SetDataFn<TData> {
    (key: keyof TData, value: TData[keyof TData]): void;
    (updater: (previousData: TData) => TData): void;
}

interface PostsFiltersProps {
    categories: PostsIndexCategory[];
    data: {
        search: string;
        category: string;
        published: string;
        featured: string;
        sort_by: string;
        sort_order: string;
        per_page: string;
    };
    setData: SetDataFn<PostsFiltersProps['data']>;
    filtersOpen: boolean;
    setFiltersOpen: (open: boolean) => void;
    savePresetDialog: boolean;
    setSavePresetDialog: (open: boolean) => void;
    presetName: string;
    setPresetName: (value: string) => void;
    presets: Array<{ id: string; name: string }>;
    handleFilter: () => void;
    handleSavePreset: () => void;
    handleApplyPreset: (presetId: string) => void;
    deletePreset: (id: string) => void;
}

interface PostsListSectionProps {
    posts: {
        data: PostsIndexPost[];
        total: number;
        last_page: number;
        current_page: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search: string;
        category: string;
        published: string;
    };
    onDeleteClick: (postId: number, postTitle: string) => void;
}

export function PostsFilters({
    categories,
    data,
    setData,
    filtersOpen,
    setFiltersOpen,
    savePresetDialog,
    setSavePresetDialog,
    presetName,
    setPresetName,
    presets,
    handleFilter,
    handleSavePreset,
    handleApplyPreset,
    deletePreset,
}: PostsFiltersProps) {
    const hasActiveFilters =
        (typeof data.search === 'string' && data.search.length > 0) ||
        data.category !== 'all' ||
        data.published !== 'all' ||
        (typeof data.featured === 'string' && data.featured.length > 0);

    return (
        <>
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
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search by title..."
                                            value={data.search}
                                            onChange={(e) =>
                                                setData('search', e.target.value)
                                            }
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label="Help: category filter"
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                </button>
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
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="published">Status</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label="Help: publication status filter"
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Filter by publication status
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
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="1">
                                                Published
                                            </SelectItem>
                                            <SelectItem value="0">Drafts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sort_by">Sort by</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label="Help: sorting options"
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Choose how to sort the posts
                                                    list
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
                                        <Label htmlFor="per_page">Per page</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label="Help: results per page"
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Number of posts to display
                                                    per page
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
                                            <SelectItem value="15">15</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
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
                                        setData((previous) => ({
                                            ...previous,
                                            search: '',
                                            category: 'all',
                                            published: 'all',
                                            featured: '',
                                            sort_by: 'created_at',
                                            sort_order: 'desc',
                                            per_page: '15',
                                        }));
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
                                    <DialogContent
                                        aria-describedby="save-preset-description"
                                    >
                                        <DialogHeader>
                                            <DialogTitle>
                                                Save Filter Preset
                                            </DialogTitle>
                                            <DialogDescription id="save-preset-description">
                                                Save the current filter
                                                configuration for quick access
                                                later.
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
                                                    setPresetName(e.target.value)
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
                                                    setSavePresetDialog(false);
                                                    setPresetName('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSavePreset}
                                                disabled={!presetName.trim()}
                                            >
                                                Save
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                {hasActiveFilters === true && (
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
                                        onClick={() => deletePreset(preset.id)}
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
        </>
    );
}

export function PostsListSection({
    posts,
    filters,
    onDeleteClick,
}: PostsListSectionProps) {
    const hasFilterDescription =
        (filters.search !== undefined &&
            filters.search !== null &&
            filters.search !== '') ||
        filters.category !== 'all' ||
        filters.published !== 'all';

    return (
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
                        onDeleteClick={onDeleteClick}
                    />
                ) : (
                    <EmptyState
                        icon={FileText}
                        title="No posts found"
                        description={
                            hasFilterDescription
                                ? 'Try adjusting the filters to find more results.'
                                : "Start by creating your first post. It's easy and quick!"
                        }
                        action={{
                            label: 'Create your first post',
                            href: '/posts/create',
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}

