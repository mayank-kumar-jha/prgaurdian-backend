import Skeleton, { SkeletonStatCard } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-emerald-950/30" />
          <Skeleton className="h-4 w-80 bg-zinc-800/40" />
        </div>
        <Skeleton className="h-8 w-36 rounded-xl bg-emerald-950/20" />
      </div>

      {/* 4 Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#0e1913]/60 border border-[#182c20] rounded-2xl p-6 h-80 flex flex-col justify-between">
          <Skeleton className="h-5 w-48 bg-zinc-800" />
          <Skeleton className="h-56 w-full rounded-xl bg-emerald-950/20" />
        </div>
        <div className="bg-[#0e1913]/60 border border-[#182c20] rounded-2xl p-6 h-80 flex flex-col justify-between">
          <Skeleton className="h-5 w-36 bg-zinc-800" />
          <Skeleton className="h-44 w-44 rounded-full mx-auto bg-emerald-950/20" />
        </div>
      </div>

      {/* Activity table skeleton */}
      <div className="bg-[#0e1913]/60 border border-[#182c20] rounded-2xl p-6 space-y-4">
        <Skeleton className="h-5 w-40 bg-zinc-800" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-zinc-800/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
