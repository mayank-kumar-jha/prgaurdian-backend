import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchReview } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import CategorizedComments from "@/components/CategorizedComments";
import {
  ArrowLeft,
  ExternalLink,
  Hash,
  GitPullRequest,
  MessageSquare,
  Sparkles,
  Coins,
  Cpu,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const review = await fetchReview(resolvedParams.id);
  if (!review) return { title: "Review Not Found — PR Guardian" };
  return {
    title: `PR #${review.prNumber || resolvedParams.id}: ${
      review.prTitle || "AI Review"
    } — PR Guardian`,
  };
}

function formatDateTime(isoString) {
  if (!isoString) return "Recently";
  return new Date(isoString).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReviewDetailPage({ params }) {
  const resolvedParams = await params;
  const session = await auth();
  const review = await fetchReview(resolvedParams.id);

  if (!review) notFound();

  const repoName =
    review.repo ||
    (review.repoOwner && review.repoName
      ? `${review.repoOwner}/${review.repoName}`
      : "Repository");

  const commentsList = Array.isArray(review.comments) ? review.comments : [];
  const tokensCount = review.tokensUsed || review.tokenCount;
  const costEst =
    review.costEstimate ||
    (tokensCount ? `$${((tokensCount / 1000) * 0.002).toFixed(4)}` : null);

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-[#030705] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title="Review Intelligence Detail" />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Back Link */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-emerald-300 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Overview</span>
              </Link>

              {/* PR Header Card */}
              <div className="bg-gradient-to-b from-[#0e1913]/95 to-[#070e0a]/95 border border-[#182c20] rounded-2xl p-6 lg:p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                {/* Top glow accent */}
                <div className="absolute top-0 left-1/4 w-96 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/50 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-emerald-950/80">
                      <GitPullRequest
                        className="w-6 h-6 text-emerald-400"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl lg:text-2xl font-bold text-white leading-snug tracking-tight">
                        {review.prTitle || `Pull Request #${review.prNumber}`}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
                        <span className="text-xs font-mono font-medium text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {repoName}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Hash className="w-3 h-3 text-zinc-500" />
                          {review.prNumber}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs text-zinc-400">
                          {formatDateTime(review.reviewedAt || review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge verdict={review.verdict} size="md" />
                  </div>
                </div>

                {/* AI Executive Summary — Highlighted prominently */}
                {review.summary && (
                  <div className="mt-6 pt-6 border-t border-[#182c20] relative">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#0a140f] to-[#070e0a] border-l-4 border-l-emerald-500 border border-[#182c20]">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          AI Executive Summary
                        </span>
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed">
                        {review.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Bar + Token/Cost Usage Metrics */}
                <div className="mt-6 pt-6 border-t border-[#182c20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {review.githubPrUrl ? (
                    <a
                      id="view-on-github-btn"
                      href={review.githubPrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0e1913] hover:bg-emerald-950/50 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold text-emerald-300 rounded-xl transition-all duration-200 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Pull Request on GitHub</span>
                    </a>
                  ) : (
                    <span />
                  )}

                  {/* Feature 8: Cost / Usage Visibility */}
                  {(tokensCount || costEst) && (
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-[#070d0a]/60 border border-[#182c20] px-3.5 py-1.5 rounded-lg">
                      {tokensCount && (
                        <span className="flex items-center gap-1 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                          {Number(tokensCount).toLocaleString()} tokens
                        </span>
                      )}
                      {tokensCount && costEst && <span className="text-zinc-700">·</span>}
                      {costEst && (
                        <span className="flex items-center gap-1 font-mono text-emerald-400/80">
                          <Coins className="w-3.5 h-3.5 text-emerald-500" />
                          {costEst} est. cost
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Categorized Comments Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-zinc-100">
                      Categorized Inline Findings
                    </h2>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {commentsList.length} Findings
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Grouped by issue category &amp; severity score
                  </span>
                </div>

                <CategorizedComments comments={commentsList} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
