"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-300",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-300",
    iconColor: "text-red-400",
  },
};

/**
 * Toast — Fixed-position notification.
 *
 * @param {Object} props
 * @param {boolean} props.show
 * @param {string} props.message
 * @param {'success'|'error'} [props.variant='success']
 * @param {() => void} [props.onDismiss]
 */
export default function Toast({ show, message, variant = "success", onDismiss }) {
  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.success;
  const Icon = cfg.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/40 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      } ${cfg.bg}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} strokeWidth={2} />
      <p className={`text-sm font-medium ${cfg.text}`}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
