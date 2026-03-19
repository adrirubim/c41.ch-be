import { useCallback, useEffect, useState } from 'react';
import type { FormDataConvertible } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import { withBasePath } from '@/lib/utils';
import { useFilterPresets } from '@/hooks/use-filter-presets';
import type {
    PostsIndexCategory,
    PostsIndexProps,
} from '@modules/posts/types/posts-index-props';

export interface UsePostsIndexPageReturn {
    posts: PostsIndexProps['posts'];
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
    setData: ReturnType<typeof useForm>['setData'];
    deleteDialog: {
        open: boolean;
        postId: number | null;
        postTitle: string;
    };
    setDeleteDialog: React.Dispatch<
        React.SetStateAction<{
            open: boolean;
            postId: number | null;
            postTitle: string;
        }>
    >;
    filtersOpen: boolean;
    setFiltersOpen: (open: boolean) => void;
    savePresetDialog: boolean;
    setSavePresetDialog: (open: boolean) => void;
    presetName: string;
    setPresetName: (value: string) => void;
    presets: ReturnType<typeof useFilterPresets>['presets'];
    handleFilter: () => void;
    handleDeleteClick: (postId: number, postTitle: string) => void;
    handleDeleteConfirm: () => void;
    handleSavePreset: () => void;
    handleApplyPreset: (presetId: string) => void;
}

export function usePostsIndexPage({
    posts,
    categories,
    filters,
}: PostsIndexProps): UsePostsIndexPageReturn {
    const { data, setData } = useForm({
        search: typeof filters.search === 'string' ? filters.search : '',
        category:
            typeof filters.category === 'string' &&
            filters.category !== null &&
            filters.category !== undefined &&
            filters.category !== ''
                ? filters.category
                : 'all',
        published:
            typeof filters.published === 'string' &&
            filters.published !== null &&
            filters.published !== undefined &&
            filters.published !== ''
                ? filters.published
                : 'all',
        featured:
            typeof filters.featured === 'string' ? filters.featured : '',
        sort_by:
            typeof filters.sort_by === 'string' &&
            filters.sort_by !== null &&
            filters.sort_by !== undefined &&
            filters.sort_by !== ''
                ? filters.sort_by
                : 'created_at',
        sort_order:
            typeof filters.sort_order === 'string' &&
            filters.sort_order !== null &&
            filters.sort_order !== undefined &&
            filters.sort_order !== ''
                ? filters.sort_order
                : 'desc',
        per_page:
            typeof filters.per_page === 'string' ||
            typeof filters.per_page === 'number'
                ? String(filters.per_page)
                : '15',
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
    const { presets, savePreset, applyPreset } = useFilterPresets();

    const handleFilter = useCallback(() => {
        router.get(
            withBasePath('/posts'),
            {
                search:
                    data.search !== undefined &&
                    data.search !== null &&
                    data.search !== ''
                        ? data.search
                        : undefined,
                category:
                    data.category !== undefined &&
                    data.category !== null &&
                    data.category !== 'all'
                        ? data.category
                        : undefined,
                published:
                    data.published !== undefined &&
                    data.published !== null &&
                    data.published !== 'all'
                        ? data.published
                        : undefined,
                featured:
                    data.featured !== undefined &&
                    data.featured !== null &&
                    data.featured !== ''
                        ? data.featured
                        : undefined,
                sort_by: data.sort_by,
                sort_order: data.sort_order,
                per_page:
                    data.per_page !== undefined &&
                    data.per_page !== null &&
                    data.per_page !== ''
                        ? data.per_page
                        : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [data]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (data.search !== undefined) {
                handleFilter();
            }
        }, 500);

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
        if (deleteDialog.postId !== null) {
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
        if (presetName.trim() !== '') {
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
        if (presetFilters !== null) {
            const filtersValue = presetFilters as Record<string, string>;
            (Object.keys(filtersValue) as (keyof typeof data)[]).forEach(
                (key) => {
                    setData(key, filtersValue[key as string]);
                },
            );
            setTimeout(() => {
                router.get(
                    withBasePath('/posts'),
                    filtersValue as Record<string, FormDataConvertible>,
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            }, 100);
        }
    };

    return {
        posts,
        categories,
        data: {
            search: data.search,
            category: data.category,
            published: data.published,
            featured: data.featured,
            sort_by: data.sort_by,
            sort_order: data.sort_order,
            per_page: String(data.per_page),
        },
        setData,
        deleteDialog,
        setDeleteDialog,
        filtersOpen,
        setFiltersOpen,
        savePresetDialog,
        setSavePresetDialog,
        presetName,
        setPresetName,
        presets,
        handleFilter,
        handleDeleteClick,
        handleDeleteConfirm,
        handleSavePreset,
        handleApplyPreset,
    };
}

