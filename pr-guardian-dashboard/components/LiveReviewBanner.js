"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/SocketProvider";
import { GitPullRequest, CheckCircle2, Loader2, X } from "lucide-react";

const STATUS = {
  idle: "idle",
  started: "started",
  progress: "progress",
  completed: "completed",
};

/**
 * LiveReviewBanner — Real-time status indicator for in-progress AI reviews.
 * Listens to Socket.IO events: review:started, review:progress, review:completed
 * Slides in when a review starts, auto-dismisses 4 s after completion.
 */
export default function LiveReviewBanner() {
  const socket = useSocket();
  const router = useRouter();

  const [status, setStatus] = useState(STATUS.idle);
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setStatus(STATUS.idle), 300);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onStarted = (data) => {
      const { repoOwner, repoName, prNumber } = data;
      setLabel(`Reviewing PR #${prNumber} in ${repoOwner}/${repoName}…`);
      setStatus(STATUS.started);
      setVisible(true);
    };

    const onProgress = (data) => {
      const msg =
        data.stage ||
        (data.currentFile && data.totalFiles
          ? `Analyzing file ${data.currentFile} of ${data.totalFiles}`
          : "Analyzing changes…");
      setLabel(msg);
      setStatus(STATUS.progress);
    };

    const onCompleted = (data) => {
      const { repoOwner, repoName, prNumber } = data;
      setLabel(`Review complete — PR #${prNumber} in ${repoOwner}/${repoName}`);
      setStatus(STATUS.completed);
      // Auto-refresh the feed and dismiss after 4 s
      setTimeout(() => {
        router.refresh();
        dismiss();
      }, 4000);
    };

    socket.on("review:started", onStarted);
    socket.on("review:progress", onProgress);
    socket.on("review:completed", onCompleted);

    return () => {
      socket.off("review:started", onStarted);
      socket.off("review:progress", onProgress);
      socket.off("review:completed", onCompleted);
    };
  }, [socket, router, dismiss]);

  if (status === STATUS.idle && !visible) return null;

  const isCompleted = status === STATUS.completed;
  const isActive = status === STATUS.started || status === STATUS.progress;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      } ${
        isCompleted
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
          : "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
      }`}
    >
      {/* Icon */}
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2} />
      ) : (
        <Loader2 className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-spin" strokeWidth={2} />
      )}

      {/* PR icon */}
      <GitPullRequest className="w-3.5 h-3.5 opacity-60 flex-shrink-0" strokeWidth={1.75} />

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
