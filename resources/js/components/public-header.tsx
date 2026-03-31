import { Link } from '#app/components/link';
import { Button } from '#app/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '#app/components/ui/sheet';
import { dashboard, login, register } from '#app/routes';
import { type SharedData } from '#app/types';
import { usePage } from '@inertiajs/react';
import { LogIn, Menu } from 'lucide-react';
import AppLogo from './app-logo';

export function PublicHeader() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as unknown as { id?: unknown; is_admin?: unknown };
    const isAuthenticated = user != null && user.id != null;
    const isAdmin = isAuthenticated && user.is_admin === true;
    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';
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
                                <Link href="/settings/profile">
                                    <Button variant="default" size="sm">
                                        Account
                                    </Button>
                                </Link>
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
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col space-y-4 px-4">
                                {!onHomePage && (
                                    <Link
                                        href="/"
                                        className="text-base font-medium"
                                    >
                                        Home
                                    </Link>
                                )}
                                {isAuthenticated && (
                                    <>
                                        <Link
                                            href="/blog"
                                            className="text-base font-medium"
                                        >
                                            Blog
                                        </Link>
                                        <Link
                                            href="/categories"
                                            className="text-base font-medium"
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
                                                >
                                                    Dashboard
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/settings/profile">
                                                <Button
                                                    variant="default"
                                                    className="w-full"
                                                >
                                                    Account
                                                </Button>
                                            </Link>
                                        )
                                    ) : showAuthActions ? (
                                        <>
                                            <Link
                                                href={login()}
                                                className="mb-2 block"
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link href={register()}>
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
