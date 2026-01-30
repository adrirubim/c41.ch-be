import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Toast {
    id: string;
    title: string;
    description: string;
    variant: 'default' | 'destructive' | 'success';
}

export function useToast() {
    const page = usePage();
    const { flash } = page.props as {
        flash?: { success?: string; error?: string; message?: string };
    };
    const currentUrl = page.url;

    const [toasts, setToasts] = useState<Toast[]>([]);
    const processedFlashRef = useRef<string>('');
    const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const addToast = useCallback(
        ({ title, description, variant }: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(7);
            setToasts((prev) => {
                // Prevent duplicates by checking if a toast with the same content already exists
                const isDuplicate = prev.some(
                    (toast) =>
                        toast.title === title &&
                        toast.description === description,
                );
                if (isDuplicate) {
                    return prev;
                }
                return [...prev, { id, title, description, variant }];
            });

            // Auto-remove after 5 seconds
            const timeoutId = setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
                timeoutRefs.current.delete(id);
            }, 5000);

            timeoutRefs.current.set(id, timeoutId);
        },
        [],
    );

    const removeToast = useCallback((id: string) => {
        // Clear timeout if it exists
        const timeoutId = timeoutRefs.current.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutRefs.current.delete(id);
        }

        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        // Check if there are any flash messages
        const success = flash?.success;
        const error = flash?.error;
        const message = flash?.message;

        // Create a unique key based on flash content
        const flashKey = `${success || ''}-${error || ''}-${message || ''}`;

        // Only process if flash has changed and contains a message
        if (
            flashKey !== processedFlashRef.current &&
            flashKey.trim() !== '--'
        ) {
            processedFlashRef.current = flashKey;
            const toAdd = { success, error, message };
            setTimeout(() => {
                if (toAdd.success) {
                    addToast({
                        title: 'Success',
                        description: toAdd.success,
                        variant: 'success',
                    });
                }
                if (toAdd.error) {
                    addToast({
                        title: 'Error',
                        description: toAdd.error,
                        variant: 'destructive',
                    });
                }
                if (toAdd.message) {
                    addToast({
                        title: 'Information',
                        description: toAdd.message,
                        variant: 'default',
                    });
                }
            }, 0);
        } else if (flashKey === '--') {
            // If there's no flash, reset the ref to allow processing new messages
            processedFlashRef.current = '';
        }
    }, [flash, addToast, currentUrl]); // Add URL as dependency to detect navigations

    // Clear timeouts on unmount
    useEffect(() => {
        const ref = timeoutRefs;
        return () => {
            ref.current.forEach((timeoutId) => clearTimeout(timeoutId));
            ref.current.clear();
        };
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
    };
}
