import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn, withBasePath } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { FileText, Folder, LayoutGrid, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CommandItemType {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    keywords?: string[];
}

const commands: CommandItemType[] = [
    {
        id: 'dashboard',
        label: 'Go to Dashboard',
        icon: LayoutGrid,
        href: '/dashboard',
        keywords: ['dashboard', 'home', 'main'],
    },
    {
        id: 'posts',
        label: 'View Posts',
        icon: FileText,
        href: '/posts',
        keywords: ['posts', 'articles', 'content'],
    },
    {
        id: 'create-post',
        label: 'Create New Post',
        icon: Plus,
        href: '/posts/create',
        keywords: ['create', 'new', 'post', 'article'],
    },
    {
        id: 'categories',
        label: 'View Categories',
        icon: Folder,
        href: '/dashboard/categories',
        keywords: ['categories', 'tags', 'groups'],
    },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenChange(!open);
            }
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const filteredCommands = commands.filter((cmd) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            cmd.label.toLowerCase().includes(searchLower) ||
            cmd.keywords?.some((keyword) =>
                keyword.toLowerCase().includes(searchLower),
            )
        );
    });

    const setSearchAndResetIndex = (value: string) => {
        setSearch(value);
        setSelectedIndex(0);
    };

    const handleSelect = (href: string) => {
        router.visit(withBasePath(href));
        onOpenChange(false);
        setSearch('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(
                (prev) =>
                    (prev - 1 + filteredCommands.length) %
                    filteredCommands.length,
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                handleSelect(filteredCommands[selectedIndex].href);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="animate-scale-in max-w-lg overflow-hidden p-0">
                <DialogHeader className="px-4 pt-4">
                    <DialogTitle>Command Palette</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <div className="relative">
                        <label htmlFor="command-search" className="sr-only">
                            Search command
                        </label>
                        <Search
                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            id="command-search"
                            ref={inputRef}
                            placeholder="Type a command or search..."
                            value={search}
                            onChange={(e) =>
                                setSearchAndResetIndex(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            className="pl-9"
                            aria-label="Search command or navigate"
                            aria-autocomplete="list"
                            role="combobox"
                            aria-expanded={open}
                        />
                    </div>
                    <div
                        className="mt-4 max-h-[300px] overflow-y-auto"
                        role="listbox"
                        aria-label="Available commands"
                    >
                        {filteredCommands.length === 0 ? (
                            <div
                                className="py-6 text-center text-sm text-muted-foreground"
                                role="status"
                                aria-live="polite"
                            >
                                No results found.
                            </div>
                        ) : (
                            <div className="space-y-1" role="listbox">
                                {filteredCommands.map((cmd, index) => {
                                    const Icon = cmd.icon;
                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={() =>
                                                handleSelect(cmd.href)
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                            className={cn(
                                                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                                                index === selectedIndex
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'hover:bg-accent/50',
                                            )}
                                            aria-label={cmd.label}
                                            role="option"
                                            aria-selected={
                                                index === selectedIndex
                                            }
                                        >
                                            <Icon
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            <span>{cmd.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
