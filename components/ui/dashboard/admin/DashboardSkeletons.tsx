import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full !bg-gray-100" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        </div>
    );
}

export function StatsGridSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
    );
}

export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 py-3 border-b last:border-0">
            <Skeleton className="h-2 w-2 rounded-full mt-2 flex-shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-4">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
        </div>
    );
}
