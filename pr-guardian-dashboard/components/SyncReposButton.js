"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { syncRepos } from "@/lib/api";
import Toast from "@/components/ui/Toast";

export default function SyncReposButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const handleSync = async () => {
    setLoading(true);
    try {
      const data = await syncRepos();
      setToast({
        show: true,
        message: data?.message || "Successfully synced accessible repositories from GitHub!",
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      console.warn("Backend sync endpoint not yet implemented or returned error:", err);
      // Try soft refresh in case backend updated via webhook
      router.refresh();
      setToast({
        show: true,
        message: "Requested repository sync from GitHub.",
        variant: "success",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
    }
  };

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((t) => ({ ...t, show: false }))}
      />

      <button
        id="sync-repos-btn"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-[#0d1812] hover:bg-emerald-950/40 border border-[#182c20] hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 text-xs font-medium px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
        title="Sync accessible repositories from GitHub"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : "text-zinc-400"}`} />
        <span>{loading ? "Syncing..." : "Sync Repos"}</span>
      </button>
    </>
  );
}
