import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutosaveOptions {
    data: Record<string, unknown>;
    storageKey: string;
    interval?: number; // milliseconds
    enabled?: boolean;
    onSave?: () => void;
}

export function useAutosave({
    data,
    storageKey,
    interval = 30000, // 30 seconds default
    enabled = true,
    onSave,
}: UseAutosaveOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const saveDraft = useCallback(() => {
        if (!enabled) return;

        const currentData = JSON.stringify(data);
        if (currentData === lastSavedRef.current) return; // No changes

        setIsSaving(true);
        lastSavedRef.current = currentData;

        try {
            // Save to localStorage
            localStorage.setItem(storageKey, currentData);
            setLastSaved(new Date());
            setIsSaving(false);
            onSave?.();
        } catch (error) {
            console.error('Autosave failed:', error);
            setIsSaving(false);
        }
    }, [data, storageKey, enabled, onSave]);

    // Load from localStorage on mount
    useEffect(() => {
        if (!enabled) return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                lastSavedRef.current = saved;
                // Optionally restore data here if needed
            }
        } catch (error) {
            console.error('Failed to load autosave:', error);
        }
    }, [storageKey, enabled]);

    useEffect(() => {
        if (!enabled) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            saveDraft();
        }, interval);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, interval, enabled, saveDraft]);

    // Save on unmount
    useEffect(() => {
        return () => {
            if (enabled && timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                saveDraft();
            }
        };
    }, [enabled, saveDraft]);

    // Clear autosave
    const clearAutosave = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            lastSavedRef.current = '';
            setLastSaved(null);
        } catch (error) {
            console.error('Failed to clear autosave:', error);
        }
    }, [storageKey]);

    return {
        saveDraft,
        isSaving,
        lastSaved,
        clearAutosave,
    };
}
