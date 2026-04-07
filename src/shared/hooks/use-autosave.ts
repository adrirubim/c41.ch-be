import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutosaveOptions {
    data: Record<string, unknown>;
    storageKey: string;
    interval?: number;
    enabled?: boolean;
    onSave?: () => void;
}

export function useAutosave({
    data,
    storageKey,
    interval = 30000,
    enabled = true,
    onSave,
}: UseAutosaveOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const saveDraft = useCallback(() => {
        if (enabled === false) {
            return;
        }

        const currentData = JSON.stringify(data);
        if (currentData === lastSavedRef.current) {
            return;
        }

        setIsSaving(true);
        lastSavedRef.current = currentData;

        try {
            localStorage.setItem(storageKey, currentData);
            setLastSaved(new Date());
            setIsSaving(false);
            onSave?.();
        } catch {
            setIsSaving(false);
        }
    }, [data, storageKey, enabled, onSave]);

    useEffect(() => {
        if (enabled === false) {
            return;
        }

        const saved = localStorage.getItem(storageKey);
        if (typeof saved === 'string' && saved !== '') {
            lastSavedRef.current = saved;
        }
    }, [storageKey, enabled]);

    useEffect(() => {
        if (enabled === false) {
            return;
        }

        if (timeoutRef.current !== null && timeoutRef.current !== undefined) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            saveDraft();
        }, interval);

        return () => {
            if (timeoutRef.current !== null && timeoutRef.current !== undefined) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, interval, enabled, saveDraft]);

    useEffect(() => {
        return () => {
            if (
                enabled === true &&
                timeoutRef.current !== null &&
                timeoutRef.current !== undefined
            ) {
                clearTimeout(timeoutRef.current);
                saveDraft();
            }
        };
    }, [enabled, saveDraft]);

    const clearAutosave = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            lastSavedRef.current = '';
            setLastSaved(null);
        } catch {
            // Storage can fail (quota, privacy mode); ignore.
        }
    }, [storageKey]);

    return {
        saveDraft,
        isSaving,
        lastSaved,
        clearAutosave,
    };
}

