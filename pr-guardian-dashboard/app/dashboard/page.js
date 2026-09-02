import { fetchStats, fetchReviews, fetchRepos } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import ActivityFeed from "@/components/ActivityFeed";
import ReviewChart from "@/components/ui/ReviewChart";
import VerdictDonutChart from "@/components/ui/VerdictDonutChart";
import CategoryBarChart from "@/components/ui/CategoryBarChart";
import {
  GitFork,
  GitPullRequest,
  CheckCircle2,
  Target,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Dashboard — PR Guardian",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recentReviews, allReviews, repos] = await Promise.all([
    fetchStats(),
    fetchReviews({ limit: 10 }),
    fetchReviews(), // Fetch all reviews
    fetchRepos(),
  ]);

  const totalReviewsCount =
    stats.totalReviews !== undefined
      ? stats.totalReviews
      : Array.isArray(allReviews)
      ? allReviews.length
      : 0;

  const totalReposCount =
    stats.totalRepos !== undefined
      ? stats.totalRepos
      : Array.isArray(repos)
      ? repos.length
      : 0;

  // Calculate actual approval rate from real reviews
  let approvedCount = 0;
  if (Array.isArray(allReviews) && allReviews.length > 0) {
    approvedCount = allReviews.filter(
      (r) => (r.verdict || "").toLowerCase() === "approve"
    ).length;
  }
  const calculatedApprovalRate =
    totalReviewsCount > 0
      ? ((approvedCount / totalReviewsCount) * 100).toFixed(1)
      : "0.0";

  // Calculate actual agent accuracy from backend or overrides
  let accuracyVal = "100%";
  let accuracySub = "No human overrides";
  if (
    stats.accuracyRate !== undefined &&
    stats.accuracyRate !== null
  ) {
    accuracyVal = `${Number(stats.accuracyRate).toFixed(1)}%`;
    accuracySub = `${stats.agreedOverrides || 0}/${stats.totalOverrides || 0} agreed`;
  } else if (
    stats.accuracyPercent !== undefined &&
    stats.accuracyPercent !== null
  ) {
    accuracyVal = `${Number(stats.accuracyPercent).toFixed(1)}%`;
    accuracySub = "Human Agreement";
  } else if (stats.totalOverrides > 0) {
    const acc = ((stats.agreedOverrides / stats.totalOverrides) * 100).toFixed(1);
    accuracyVal = `${acc}%`;
    accuracySub = `${stats.agreedOverrides}/${stats.totalOverrides} agreed`;
  }

  const approvalRateStr =
    stats.approvalRate !== undefined && stats.approvalRate !== null
      ? `${Number(stats.approvalRate).toFixed(1)}%`
      : `${calculatedApprovalRate}%`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header with live glow pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Command Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
              Live Guardian
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time analytics, agent accuracy metrics, and recent autonomous code reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-950/40 to-[#070e0a] border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gemini AI Engine Active</span>
        </div>
      </div>

      {/* Stat cards row (strictly actual data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GitFork}
          label="Repos Monitored"
          value={totalReposCount}
          sub={`${totalReposCount} total`}
          trend="neutral"
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          icon={GitPullRequest}
          label="PRs Reviewed"
          value={totalReviewsCount}
          sub={`${totalReviewsCount} total`}
          trend="neutral"
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
        />
        <StatCard
          icon={Target}
          label="Agent Accuracy"
          value={accuracyVal}
          sub={accuracySub}
          trend="up"
          iconColor="text-emerald-300"
          iconBg="bg-emerald-400/15 border-emerald-400/30"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approval Rate"
          value={approvalRateStr}
          sub={`${approvedCount}/${totalReviewsCount} approved`}
          trend="neutral"
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
        />
      </div>

      {/* Multi-Chart Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main 14-Day Timeline Chart (takes 2 columns) */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">
                  Review Activity (14 Days)
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Real Time
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Daily volume of AI approvals, changes requested, and comments
              </p>
            </div>
          </div>
          <ReviewChart reviews={allReviews} days={14} />
        </div>

        {/* Verdict Distribution Donut Chart (takes 1 column) */}
        <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl p-6 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">
              Verdict Breakdown
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Distribution of review outcomes
            </p>
          </div>
          <VerdictDonutChart reviews={allReviews} />
        </div>
      </div>

      {/* Issue Category Distribution Bar Chart */}
      <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl p-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">
              Issue Category Analysis
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Breakdown of findings extracted from actual PR review comments
            </p>
          </div>
        </div>
        <CategoryBarChart reviews={allReviews} />
      </div>

      {/* Recent activity feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">
              Recent Pull Request Reviews
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live log of PR Guardian reviews &amp; analysis summaries
            </p>
          </div>
          <span className="text-xs text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            {recentReviews.length} Reviews
          </span>
        </div>
        <ActivityFeed reviews={recentReviews} />
      </div>
    </div>
  );
}
