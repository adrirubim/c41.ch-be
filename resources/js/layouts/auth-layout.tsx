import AppLogo from '@/components/app-logo';
import { Link } from '@/components/link';
import { PublicHeader } from '@/components/public-header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';
import { type PropsWithChildren } from 'react';

export default function AuthLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    title?: string;
    description?: string;
}>) {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            {/* Animated Neon Background - Same as homepage */}
            <div className="neon-background">
                <div className="neon-orb neon-orb-1"></div>
                <div className="neon-orb neon-orb-2"></div>
                <div className="neon-orb neon-orb-3"></div>
                <div className="neon-orb neon-orb-4"></div>
                <div className="neon-shape neon-shape-1"></div>
                <div className="neon-shape neon-shape-2"></div>
                <div className="neon-shape neon-shape-3"></div>
                <div className="neon-shape neon-shape-4"></div>
                <div className="neon-shape neon-shape-5"></div>
                <div className="neon-shape neon-shape-6"></div>
            </div>
            <div className="neon-overlay"></div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <PublicHeader />

                <main className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md">
                        <Card
                            className="border-border/50 shadow-2xl"
                            style={{
                                backgroundColor:
                                    'color-mix(in oklab, var(--card) 85%, transparent)',
                                WebkitBackdropFilter: 'blur(24px)',
                                backdropFilter: 'blur(24px)',
                            }}
                        >
                            <CardHeader className="space-y-1 text-center">
                                <div className="mb-4 flex justify-center">
                                    <Link
                                        href={home()}
                                        className="flex items-center gap-2"
                                    >
                                        <AppLogo />
                                    </Link>
                                </div>
                                <CardTitle className="text-2xl">
                                    {title}
                                </CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                            <CardContent>{children}</CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
