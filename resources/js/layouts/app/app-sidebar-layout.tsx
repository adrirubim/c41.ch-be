import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { CommandPalette } from '@/components/command-palette';
import { FloatingActionButton } from '@/components/floating-action-button';
import { Toaster } from '@/components/toaster';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { commandPaletteOpen, setCommandPaletteOpen } = useCommonShortcuts();

    return (
        <AppShell variant="sidebar">
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden"
                id="main-content"
                tabIndex={-1}
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <FloatingActionButton />
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />
            <Toaster />
        </AppShell>
    );
}
