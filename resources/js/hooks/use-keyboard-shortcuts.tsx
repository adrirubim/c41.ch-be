import { withBasePath } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                // For Ctrl/Cmd+K, we want either Ctrl (Windows/Linux) or Cmd (Mac)
                const modifierMatch =
                    shortcut.ctrlKey || shortcut.metaKey
                        ? event.ctrlKey || event.metaKey
                        : !event.ctrlKey && !event.metaKey;

                const shiftMatch = shortcut.shiftKey
                    ? event.shiftKey
                    : !event.shiftKey;
                const keyMatch =
                    event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (modifierMatch && shiftMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

// Common shortcuts
export function useCommonShortcuts() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlKey: true,
            metaKey: true,
            action: () => {
                setCommandPaletteOpen(true);
            },
            description: 'Open search',
        },
        {
            key: 'n',
            ctrlKey: true,
            metaKey: true,
            action: () => {
                router.visit(withBasePath('/posts/create'));
            },
            description: 'Create new post',
        },
    ]);

    return { commandPaletteOpen, setCommandPaletteOpen };
}
