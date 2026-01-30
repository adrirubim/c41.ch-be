import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonPostDetail() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 md:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/6" />
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-18" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
