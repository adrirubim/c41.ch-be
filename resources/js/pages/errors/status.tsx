import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    getErrorStatusCta,
    type ErrorStatusCode,
} from '@modules/errors/utils/get-error-status-cta';
import { Head } from '@inertiajs/react';

interface ErrorStatusProps {
    status: ErrorStatusCode;
    title: string;
    description: string;
}

export default function ErrorStatus({
    status,
    title,
    description,
}: ErrorStatusProps) {
    const primaryCta = getErrorStatusCta(status);

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`${status} - ${title}`} />
            <div className="flex h-full flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold tabular-nums">
                                {status}
                            </span>
                            <span>{title}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Go back
                            </Button>
                            <Link
                                href={primaryCta.href}
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full sm:w-auto">
                                    {primaryCta.label}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
