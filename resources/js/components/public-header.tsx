import {
    LazyUserMenuContent,
    preloadLazyUserMenuContent,
} from '#app/components/lazy-user-menu-content';
import { Link } from '#app/components/link';
import { Button } from '#app/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '#app/components/ui/sheet';
import { UserInfo } from '#app/components/user-info';
import { useMobileNavigation } from '#app/hooks/use-mobile-navigation';
import { withBasePath } from '#app/lib/utils';
import { dashboard, login, logout, register } from '#app/routes';
import { edit } from '#app/routes/profile';
import { type SharedData } from '#app/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogIn, LogOut, Menu, Settings } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

function HeaderUserMenu() {
    const { auth } = usePage<SharedData>().props;

    if (auth.user == null) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onPointerEnter={() => preloadLazyUserMenuContent()}
                    onFocus={() => preloadLazyUserMenuContent()}
                >
                    <UserInfo user={auth.user} />
                    <ChevronsUpDown className="ml-auto size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 rounded-lg" align="end">
                <LazyUserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PublicHeader() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const cleanupMobileNavigation = useMobileNavigation();
    const user = auth.user;
    const isAuthenticated = user !== null;
    const isAdmin = user?.is_admin === true;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentPath = page.url.split('?')[0] ?? '';
    const onHomePage = currentPath === '/';
    const showAuthActions = !isAuthenticated;
    // On the landing page (`/`), mobile auth actions should appear only inside
    // the hamburger menu dropdown (not on the sticky top bar).
    const showRightAuthButtons = !onHomePage;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:max-w-7xl">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <AppLogo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center justify-center space-x-6 md:flex">
                    {!onHomePage && (
                        <Link
                            href="/"
                            className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                        >
                            Home
                        </Link>
                    )}
                    {isAuthenticated && (
                        <>
                            <Link
                                href="/blog"
                                className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                            >
                                Blog
                            </Link>
                            <Link
                                href="/categories"
                                className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                            >
                                Categories
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Side - Login/Auth */}
                <div className="flex items-center justify-end space-x-4">
                    <div
                        className={showRightAuthButtons ? '' : 'hidden md:flex'}
                    >
                        {isAuthenticated ? (
                            isAdmin ? (
                                <Link href={dashboard()}>
                                    <Button variant="default" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <HeaderUserMenu />
                            )
                        ) : showAuthActions ? (
                            <div className="flex items-center space-x-2">
                                <Link href={login()}>
                                    <Button variant="ghost" size="sm">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Log in
                                    </Button>
                                </Link>
                                <Link href={register()}>
                                    <Button variant="default" size="sm">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>
                        ) : null}
                    </div>

                    {/* Mobile Menu */}
                    <Sheet
                        open={mobileMenuOpen}
                        onOpenChange={setMobileMenuOpen}
                    >
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Main navigation and account actions
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col space-y-4 px-4">
                                {!onHomePage && (
                                    <Link
                                        href="/"
                                        className="text-base font-medium"
                                        onClick={() => {
                                            cleanupMobileNavigation();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Home
                                    </Link>
                                )}
                                {isAuthenticated && (
                                    <>
                                        <Link
                                            href="/blog"
                                            className="text-base font-medium"
                                            onClick={() => {
                                                cleanupMobileNavigation();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Blog
                                        </Link>
                                        <Link
                                            href="/categories"
                                            className="text-base font-medium"
                                            onClick={() => {
                                                cleanupMobileNavigation();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Categories
                                        </Link>
                                    </>
                                )}
                                <div className="border-t px-4 pt-4">
                                    {isAuthenticated ? (
                                        isAdmin ? (
                                            <Link href={dashboard()}>
                                                <Button
                                                    variant="default"
                                                    className="w-full"
                                                    onClick={() => {
                                                        cleanupMobileNavigation();
                                                        setMobileMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                >
                                                    Dashboard
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <UserInfo
                                                        user={user!}
                                                        showEmail={true}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit()}
                                                            prefetch
                                                            onClick={() => {
                                                                cleanupMobileNavigation();
                                                                setMobileMenuOpen(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            <Settings className="mr-2 h-4 w-4" />
                                                            Settings
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            cleanupMobileNavigation();
                                                            setMobileMenuOpen(
                                                                false,
                                                            );
                                                            router.post(
                                                                withBasePath(
                                                                    logout(),
                                                                ),
                                                            );
                                                        }}
                                                        data-test="logout-button"
                                                    >
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        Log out
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    ) : showAuthActions ? (
                                        <>
                                            <Link
                                                href={login()}
                                                className="mb-2 block"
                                                onClick={() => {
                                                    cleanupMobileNavigation();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link
                                                href={register()}
                                                onClick={() => {
                                                    cleanupMobileNavigation();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <Button
                                                    variant="default"
                                                    className="w-full"
                                                >
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    ) : null}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
