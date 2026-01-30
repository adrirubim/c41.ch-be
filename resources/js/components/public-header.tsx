import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { LogIn, Menu } from 'lucide-react';
import AppLogo from './app-logo';

export function PublicHeader() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:max-w-7xl">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <AppLogo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center space-x-6 md:flex">
                    <Link
                        href="/"
                        className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                    >
                        Home
                    </Link>
                    <Link
                        href="/blog"
                        className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                    >
                        Blog
                    </Link>
                    <Link
                        href="/categories"
                        className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                    >
                        Categories
                    </Link>
                </nav>

                {/* Right Side - Login/Auth */}
                <div className="flex items-center space-x-4">
                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button variant="default" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <div className="hidden items-center space-x-2 md:flex">
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
                    )}

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
                                <Link
                                    href="/"
                                    className="text-base font-medium"
                                >
                                    Home
                                </Link>
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
                                <div className="border-t px-4 pt-4">
                                    {auth.user ? (
                                        <Link href={dashboard()}>
                                            <Button
                                                variant="default"
                                                className="w-full"
                                            >
                                                Dashboard
                                            </Button>
                                        </Link>
                                    ) : (
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
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
