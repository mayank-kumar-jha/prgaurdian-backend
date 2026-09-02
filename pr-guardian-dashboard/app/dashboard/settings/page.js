"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Settings,
  Save,
  Loader2,
  ShieldCheck,
  Sparkles,
  FileCode,
  Bell,
  Globe,
  Info,
  AlertCircle,
} from "lucide-react";
import StrictnessSelector from "@/components/ui/StrictnessSelector";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchGlobalSettings() {
  try {
    const res = await fetch(`${BASE}/api/settings/global`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return null;
  }
}

async function saveGlobalSettings(payload) {
  const res = await fetch(`${BASE}/api/settings/global`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`Failed to save: ${res.status} ${msg}`);
  }
  return res.json();
}

const DEFAULT_SETTINGS = {
  defaultStrictness: "balanced",
  autoApproveTrivial: false,
  globalCustomRules: "",
  notifyOnBlock: true,
  notifyOnApprove: false,
};

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [errorMsg, setErrorMsg] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    fetchGlobalSettings().then((data) => {
      if (data) {
        setSettings({
          defaultStrictness: data.defaultStrictness ?? "balanced",
          autoApproveTrivial: !!data.autoApproveTrivial,
          globalCustomRules: data.globalCustomRules ?? "",
          notifyOnBlock: data.notifyOnBlock !== false,
          notifyOnApprove: !!data.notifyOnApprove,
        });
      } else {
        setBackendAvailable(false);
      }
      setLoading(false);
    });
  }, []);

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "success" }), 3500);
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      try {
        await saveGlobalSettings(settings);
        showToast("Global settings saved! Applied to all new repos.", "success");
      } catch (err) {
        const msg = err.message || "Failed to save. Please try again.";
        setErrorMsg(msg);
        showToast(msg, "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-28 gap-3">
        <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
        <p className="text-xs text-zinc-500">Loading global settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/50 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/60">
          <Globe className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Global Settings</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              App-Wide
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Default rules applied to all repositories. Per-repo settings override these.
          </p>
        </div>
      </div>

      {/* Backend unavailable banner */}
      {!backendAvailable && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-950/30 border border-amber-500/25 rounded-xl text-xs text-amber-300">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Could not reach the backend — showing defaults. Changes will be saved once the
            backend is reachable.
          </span>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

        {/* Default Strictness */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100">Default Review Strictness</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-5">
            Applied to every newly connected repository unless overridden in its own settings.
          </p>
          <StrictnessSelector
            value={settings.defaultStrictness}
            onChange={(val) => setSettings((s) => ({ ...s, defaultStrictness: val }))}
          />
        </div>

        {/* Auto-approve trivial */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-100">Auto-Approve Trivial Changes</h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Automatically approve pull requests that only modify docs, formatting, typos, or
                minor lockfile bumps — globally across all repos.
              </p>
            </div>
            <Toggle
              id="global-auto-approve-toggle"
              checked={settings.autoApproveTrivial}
              onChange={(val) => setSettings((s) => ({ ...s, autoApproveTrivial: val }))}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 lg:p-7 border-b border-[#182c20] space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100">Review Notifications</h2>
          </div>
          <p className="text-xs text-zinc-400 -mt-1">
            Control when PR Guardian posts comments back to GitHub.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Notify on Block / Request Changes</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Post a review comment when a PR is blocked.</p>
            </div>
            <Toggle
              id="notify-on-block-toggle"
              checked={settings.notifyOnBlock}
              onChange={(val) => setSettings((s) => ({ ...s, notifyOnBlock: val }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Notify on Approve</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Post a comment when a PR is automatically approved.</p>
            </div>
            <Toggle
              id="notify-on-approve-toggle"
              checked={settings.notifyOnApprove}
              onChange={(val) => setSettings((s) => ({ ...s, notifyOnApprove: val }))}
            />
          </div>
        </div>

        {/* Global custom rules */}
        <div className="p-6 lg:p-7 border-b border-[#182c20]">
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100">Global Custom Rules & Guidelines</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Instructions injected into every AI review prompt across all repositories. Per-repo
            rules are appended after these.
          </p>
          <div className="relative">
            <textarea
              id="global-custom-rules-input"
              value={settings.globalCustomRules}
              onChange={(e) =>
                setSettings((s) => ({ ...s, globalCustomRules: e.target.value }))
              }
              rows={5}
              placeholder={`e.g.\n- Always check for missing error handling.\n- Flag any hardcoded secrets or API keys.\n- Ensure all async functions have try/catch blocks.\n- Prefer descriptive variable names over single letters.`}
              className="w-full bg-[#08100c] border border-[#182c20] focus:border-emerald-500/50 rounded-xl p-4 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-y leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2 text-[11px] text-zinc-500">
              <span>Passed as a system-level instruction to the Gemini review engine</span>
              <span>{settings.globalCustomRules.length} characters</span>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="px-6 py-3 bg-red-950/30 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Save footer */}
        <div className="px-6 py-4 bg-[#070e0a]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Applies to all repos immediately. Per-repo overrides take priority.
          </p>
          <button
            id="save-global-settings-btn"
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
                Saving…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Global Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
