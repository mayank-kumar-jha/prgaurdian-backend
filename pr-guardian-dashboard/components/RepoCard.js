"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GitFork, Clock, Settings, GitPullRequest, ShieldCheck } from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import { toggleRepoActive } from "@/lib/api";

function formatDate(isoString) {
  if (!isoString) return "Never";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RepoCard({ repo }) {
  const repoId = repo._id || repo.id;
  const [active, setActive] = useState(repo.active !== undefined ? repo.active : true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActive(repo.active !== undefined ? repo.active : true);
  }, [repo.active]);

  const handleToggle = async (value) => {
    setSaving(true);
    setActive(value);
    try {
      await toggleRepoActive(repoId, value);
    } catch (err) {
      console.error("Failed to toggle repo status:", err);
      setActive(!value); // revert on error
    } finally {
      setSaving(false);
    }
  };

  const repoName = repo.name || `${repo.owner || "owner"}/${repo.repoName || "repo"}`;

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          active
            ? "bg-gradient-to-r from-emerald-600/30 to-teal-800/20"
            : "bg-zinc-800/30"
        }`}
      />

      <div
        className={`relative bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group-hover:shadow-xl shadow-black/40 ${
          active
            ? "border-[#182c20] group-hover:border-emerald-500/40"
            : "border-zinc-800/60 opacity-60"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GitFork className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate group-hover:text-emerald-300 transition-colors">
                {repoName}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                  }`}
                />
                {active ? "Guardian Active" : "Paused"}
              </div>
            </div>
          </div>

          <Toggle
            id={`repo-toggle-${repoId}`}
            checked={active}
            onChange={handleToggle}
            disabled={saving}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#0a120e]/70 border border-[#182c20] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <GitPullRequest className="w-3 h-3 text-emerald-400/70" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Reviews
              </span>
            </div>
            <p className="text-lg font-bold text-white font-mono leading-none">
              {repo.totalReviews ?? repo.reviewCount ?? 0}
            </p>
          </div>

          <div className="bg-[#0a120e]/70 border border-[#182c20] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Last reviewed
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-300 leading-tight truncate">
              {formatDate(repo.lastReviewed || repo.updatedAt)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#142319] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
            AI Guarded
          </span>
          <Link
            href={`/dashboard/repos/${repoId}/settings`}
            id={`repo-settings-${repoId}`}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors duration-150 bg-[#0d1812] hover:bg-emerald-950/40 border border-[#182c20] px-2.5 py-1 rounded-lg"
          >
            <Settings className="w-3 h-3" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
