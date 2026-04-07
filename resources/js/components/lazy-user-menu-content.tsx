import type { User } from '#app/types';
import { lazy, Suspense } from 'react';

let userMenuContentImport: Promise<unknown> | null = null;

function preloadUserMenuContent(): void {
    userMenuContentImport ??= import('#app/components/user-menu-content');
}

const UserMenuContentLazy = lazy(async () => {
    preloadUserMenuContent();
    const mod =
        (await userMenuContentImport) as typeof import('#app/components/user-menu-content');
    return { default: mod.UserMenuContent };
});

export function LazyUserMenuContent({ user }: { user: User }) {
    return (
        <Suspense
            fallback={
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading…
                </div>
            }
        >
            <UserMenuContentLazy user={user} />
        </Suspense>
    );
}

export function preloadLazyUserMenuContent(): void {
    preloadUserMenuContent();
}
