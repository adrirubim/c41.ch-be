import { Link } from '#app/components/link';
import { NavFooter } from '#app/components/nav-footer';
import { NavMain } from '#app/components/nav-main';
import { NavUser } from '#app/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '#app/components/ui/sidebar';
import { dashboard } from '#app/routes';
import { type NavItem } from '#app/types';
import { FileText, LayoutGrid, Tag } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Posts',
        href: '/posts',
        icon: FileText,
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
        icon: Tag,
    },
];

// Footer navigation items removed - not needed for production
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/blog" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
