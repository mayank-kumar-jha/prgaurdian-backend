/**
 * Skeleton — Pulsing placeholder for loading states.
 *
 * @param {Object} props
 * @param {string} [props.className] - Extra Tailwind classes for width/height
 * @param {'rect'|'circle'} [props.shape='rect']
 */
export default function Skeleton({ className = "", shape = "rect" }) {
  const base =
    "animate-pulse bg-zinc-800 " +
    (shape === "circle" ? "rounded-full" : "rounded-lg");
  return <div className={`${base} ${className}`} aria-hidden="true" />;
}

/** Convenience: a row of skeleton lines for text-like content */
export function SkeletonText({ lines = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Convenience: a full stat-card skeleton */
export function SkeletonStatCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8" shape="rect" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
