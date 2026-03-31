import { AppContent } from '#app/components/app-content';
import { AppShell } from '#app/components/app-shell';
import { AppSidebar } from '#app/components/app-sidebar';
import { AppSidebarHeader } from '#app/components/app-sidebar-header';
import { CommandPalette } from '#app/components/command-palette';
import { FloatingActionButton } from '#app/components/floating-action-button';
import { Toaster } from '#app/components/toaster';
import { useCommonShortcuts } from '#app/hooks/use-keyboard-shortcuts';
import { type BreadcrumbItem } from '#app/types';
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
