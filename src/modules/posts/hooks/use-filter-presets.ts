import { useCallback, useState } from 'react';

import type { FilterPreset } from '@modules/posts/types/filter-presets';

const STORAGE_KEY = 'post_filter_presets';

function loadPresetsFromStorage(): FilterPreset[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (typeof stored === 'string' && stored !== '') {
        const parsed = JSON.parse(stored) as Array<{
            id: string;
            name: string;
            filters: Record<string, unknown>;
            createdAt: string;
        }>;
        return parsed.map((preset) => ({
            ...preset,
            createdAt: new Date(preset.createdAt),
        }));
    }
    return [];
}

export function useFilterPresets() {
    const [presets, setPresets] = useState<FilterPreset[]>(loadPresetsFromStorage);

    const savePresets = useCallback((newPresets: FilterPreset[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
            setPresets(newPresets);
        } catch (error) {
             
            console.error('Failed to save filter presets:', error);
        }
    }, []);

    const savePreset = useCallback(
        (name: string, filters: Record<string, unknown>) => {
            const newPreset: FilterPreset = {
                id: `preset-${Date.now()}`,
                name,
                filters,
                createdAt: new Date(),
            };
            const updated = [...presets, newPreset];
            savePresets(updated);
            return newPreset;
        },
        [presets, savePresets],
    );

    const deletePreset = useCallback(
        (id: string) => {
            const updated = presets.filter((preset) => preset.id !== id);
            savePresets(updated);
        },
        [presets, savePresets],
    );

    const applyPreset = useCallback(
        (id: string) => {
            const preset = presets.find((candidate) => candidate.id === id);
            return preset === undefined ? null : preset.filters;
        },
        [presets],
    );

    return {
        presets,
        savePreset,
        deletePreset,
        applyPreset,
    };
}

