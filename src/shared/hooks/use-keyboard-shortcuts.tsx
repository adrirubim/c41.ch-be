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
                const needsCtrl = shortcut.ctrlKey === true;
                const needsMeta = shortcut.metaKey === true;
                const requiresModifier = needsCtrl || needsMeta;
                const hasModifier = event.ctrlKey || event.metaKey;
                const modifierMatch = requiresModifier ? hasModifier : !hasModifier;

                const shiftRequired = shortcut.shiftKey === true;
                const shiftMatch = shiftRequired ? event.shiftKey : !event.shiftKey;
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

