import Link from "next/link";
import { GitPullRequest, Clock, ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/Badge";

function formatRelativeTime(isoString) {
  if (!isoString) return "recently";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function ActivityFeed({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="bg-gradient-to-b from-[#0e1913]/80 to-[#070e0a]/90 border border-[#182c20] rounded-2xl p-12 text-center shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <GitPullRequest className="w-6 h-6 text-emerald-500/50" />
        </div>
        <p className="text-sm font-medium text-zinc-300">No reviews yet</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Reviews will appear automatically when pull requests are opened or synchronized.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl overflow-hidden shadow-xl shadow-black/40">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2.5fr_1.5fr_auto_auto] gap-4 px-6 py-3.5 border-b border-[#182c20] bg-[#070e0a]/70">
        <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider">
          Pull Request
        </span>
        <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider hidden sm:block">
          Repository
        </span>
        <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider">
          Verdict
        </span>
        <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider text-right">
          Time
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#142319]">
        {reviews.map((review) => {
          const id = review._id || review.id;
          const repoName =
            review.repo ||
            (review.repoOwner && review.repoName
              ? `${review.repoOwner}/${review.repoName}`
              : "Repository");

          return (
            <Link
              key={id}
              href={`/reviews/${id}`}
              id={`review-row-${id}`}
              className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2.5fr_1.5fr_auto_auto] gap-4 px-6 py-4 hover:bg-[#0f2117]/50 transition-colors duration-150 group items-center"
            >
              {/* PR title */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-400/40 transition-colors">
                    <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors truncate font-medium">
                    {review.prTitle || `PR #${review.prNumber || id}`}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 mt-1 block sm:hidden truncate pl-8">
                  {repoName} · #{review.prNumber}
                </span>
                <span className="text-xs text-zinc-500 mt-0.5 hidden sm:block pl-8.5 font-mono">
                  #{review.prNumber}
                </span>
              </div>

              {/* Repo */}
              <span className="text-xs text-zinc-400 font-mono truncate hidden sm:block">
                {repoName}
              </span>

              {/* Verdict badge */}
              <div>
                <Badge verdict={review.verdict} size="sm" />
              </div>

              {/* Time + Go Icon */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-1 text-zinc-500">
                  <Clock className="w-3 h-3 hidden sm:block" />
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatRelativeTime(review.reviewedAt || review.createdAt)}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors hidden md:block" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
