import Skeleton from "@/components/ui/Skeleton";

export default function ReposLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-emerald-950/30" />
          <Skeleton className="h-4 w-72 bg-zinc-800/40" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl bg-emerald-950/30" />
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#0e1913]/60 border border-[#182c20] rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-emerald-950/30" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 bg-zinc-800" />
                <Skeleton className="h-3 w-20 bg-zinc-800/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14 rounded-xl bg-zinc-800/20" />
              <Skeleton className="h-14 rounded-xl bg-zinc-800/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
