import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton shown while events are fetching. */
export function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4 flex-1" role="status" aria-label="Loading calendar">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden flex-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="bg-card min-h-[90px] p-2 space-y-1.5">
            <Skeleton className="h-5 w-5 ml-auto rounded-full" />
            {i % 5 === 0 && <Skeleton className="h-4 w-full rounded" />}
            {i % 7 === 0 && <Skeleton className="h-4 w-3/4 rounded" />}
          </div>
        ))}
      </div>
    </div>
  );
}
