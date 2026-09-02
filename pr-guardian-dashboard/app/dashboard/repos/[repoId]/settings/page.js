"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  GitFork,
  FileCode,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import StrictnessSelector from "@/components/ui/StrictnessSelector";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";
import { fetchRepo, fetchSettings, updateSettings } from "@/lib/api";

export default function RepoSettingsPage({ params }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [repoId, setRepoId] = useState(null);
  const [repo, setRepo] = useState(null);
  const [settings, setSettings] = useState({
    strictness: "balanced",
    autoApproveTrivial: false,
    customRules: "",
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setRepoId(resolved.repoId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!repoId) return;
    async function load() {
      const [repoData, settingsData] = await Promise.all([
        fetchRepo(repoId),
        fetchSettings(repoId),
      ]);
      if (!repoData) {
        router.replace("/dashboard/repos");
        return;
      }
      setRepo(repoData);
      setSettings({
        strictness: settingsData.strictness || "balanced",
        autoApproveTrivial: !!settingsData.autoApproveTrivial,
        customRules: settingsData.customRules || "",
      });
      setLoading(false);
    }
    load();
  }, [repoId, router]);

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "success" }), 3500);
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      try {
        await updateSettings(repoId, settings);
        showToast("Settings saved successfully! Rules will apply on next PR.", "success");
      } catch (err) {
        console.error("Failed to update settings:", err);
        const msg = err.message || "Failed to save settings. Please try again.";
        setErrorMsg(msg);
        showToast(msg, "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-28 gap-3">
        <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
        <p className="text-xs text-zinc-500">Loading repository rules...</p>
      </div>
    );
  }

  const repoName = repo.name || `${repo.owner || "owner"}/${repo.repoName || "repo"}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Back link + header */}
      <div>
        <Link
          href="/dashboard/repos"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-emerald-300 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Repositories</span>
        </Link>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/50 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/60">
            <GitFork className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {repoName}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Rules
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure strictness thresholds, auto-approval filters, and custom prompt rules.
            </p>
          </div>
        </div>
      </div>

      {/* Settings card */}
      <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Strictness */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100">
              Review Strictness Level
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mb-5">
            Controls how deeply the agent analyzes changes, edge cases, and code style.
          </p>
          <StrictnessSelector
            value={settings.strictness}
            onChange={(val) => setSettings((s) => ({ ...s, strictness: val }))}
          />
        </div>

        {/* Auto-approve toggle */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-100">
                  Auto-Approve Trivial Changes
                </h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Automatically approve pull requests that solely modify documentation,
                formatting, typos, or minor lockfile bumps with zero logic changes.
              </p>
            </div>
            <Toggle
              id={`auto-approve-toggle-${repoId}`}
              checked={settings.autoApproveTrivial}
              onChange={(val) =>
                setSettings((s) => ({ ...s, autoApproveTrivial: val }))
              }
            />
          </div>
        </div>

        {/* Feature 6: Custom Rules Textarea */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-zinc-100">
                Custom Repository Rules &amp; Guidelines
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inject specialized instructions directly into the AI review prompt for this repository.
            </p>
          </div>

          <div className="relative">
            <textarea
              id={`custom-rules-input-${repoId}`}
              value={settings.customRules}
              onChange={(e) =>
                setSettings((s) => ({ ...s, customRules: e.target.value }))
              }
              rows={5}
              placeholder={`e.g.\n- Always flag missing JSDoc / docstrings on exported functions.\n- Forbid usage of 'any' types in TypeScript files.\n- Ensure database queries include indexes or limits.\n- Prefer using modern React Hooks over class patterns.`}
              className="w-full bg-[#08100c] border border-[#182c20] focus:border-emerald-500/50 rounded-xl p-4 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-y leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2 text-[11px] text-zinc-500">
              <span>Plain text instructions passed directly to Gemini review engine</span>
              <span>{settings.customRules.length} characters</span>
            </div>
          </div>
        </div>

        {/* Error message banner if any */}
        {errorMsg && (
          <div className="px-6 py-3 bg-red-950/30 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Save footer */}
        <div className="px-6 py-4 bg-[#070e0a]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Updates will take effect immediately on incoming webhooks.
          </p>
          <button
            id={`save-settings-btn-${repoId}`}
            onClick={handleSave}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg ${
              isPending
                ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-emerald-950/60 active:scale-[0.98]"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving Changes…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
