import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonPostItem() {
    return (
        <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
        </div>
    );
}

export function SkeletonPostList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonPostItem key={i} />
            ))}
        </div>
    );
}
