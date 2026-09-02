import { fetchRepos } from "@/lib/api";
import RepoCard from "@/components/RepoCard";
import SyncReposButton from "@/components/SyncReposButton";
import { GitFork, Plus, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Repositories — PR Guardian",
};

export const dynamic = "force-dynamic";

export default async function ReposPage() {
  const repos = await fetchRepos();
  const installUrl =
    process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
    "https://github.com/apps/prgaurdian/installations/new";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Connected Repositories
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
              {repos.length} Repos
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Repositories with PR Guardian AI automation enabled.
          </p>
        </div>

        {/* Action Buttons: Sync Repos + Connect a Repo */}
        <div className="flex items-center gap-2.5">
          <SyncReposButton />
          <a
            id="connect-repo-btn"
            href={installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
            <span>Connect a Repo</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Grid or Empty state */}
      {repos.length === 0 ? (
        <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl p-16 text-center shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/60">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">
              No Repositories Connected Yet
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Install the PR Guardian GitHub App on your personal or organization repositories to start getting instant automated AI pull request reviews.
            </p>
            <a
              id="empty-state-connect-btn"
              href={installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/60 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>Install PR Guardian on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {repos.map((repo) => {
            const id = repo._id || repo.id;
            return <RepoCard key={id} repo={{ ...repo, id }} />;
          })}
        </div>
      )}
    </div>
  );
}
