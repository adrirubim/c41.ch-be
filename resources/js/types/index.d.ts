import type { FormComponentSlotProps, PageProps } from '@inertiajs/core';
import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export type { FormComponentSlotProps };

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export type SharedData = PageProps & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    requestId: string | null;
    cspNonce: string | null;
    sidebarOpen: boolean;
    flash: {
        success: string | null;
        error: string | null;
        message: string | null;
    };
    basePath: string;
};

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    is_admin: boolean;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
}
