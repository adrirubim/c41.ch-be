import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-24" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16" />
            </CardContent>
        </Card>
    );
}

export function SkeletonCardList({ count = 3 }: { count?: number }) {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
