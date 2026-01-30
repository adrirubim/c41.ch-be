import { useCallback, useState } from 'react';

export interface FilterPreset {
    id: string;
    name: string;
    filters: Record<string, unknown>;
    createdAt: Date;
}

const STORAGE_KEY = 'post_filter_presets';

function loadPresetsFromStorage(): FilterPreset[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as Array<{
                id: string;
                name: string;
                filters: Record<string, unknown>;
                createdAt: string;
            }>;
            return parsed.map((p) => ({
                ...p,
                createdAt: new Date(p.createdAt),
            }));
        }
    } catch (error) {
        console.error('Failed to load filter presets:', error);
    }
    return [];
}

export function useFilterPresets() {
    const [presets, setPresets] = useState<FilterPreset[]>(
        loadPresetsFromStorage,
    );

    // Save presets to localStorage
    const savePresets = useCallback((newPresets: FilterPreset[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
            setPresets(newPresets);
        } catch (error) {
            console.error('Failed to save filter presets:', error);
        }
    }, []);

    // Save a new preset
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

    // Delete a preset
    const deletePreset = useCallback(
        (id: string) => {
            const updated = presets.filter((p) => p.id !== id);
            savePresets(updated);
        },
        [presets, savePresets],
    );

    // Apply a preset
    const applyPreset = useCallback(
        (id: string) => {
            const preset = presets.find((p) => p.id === id);
            return preset ? preset.filters : null;
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
