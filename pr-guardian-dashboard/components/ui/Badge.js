/**
 * Verdict badge component with deep neon green / amber / red glow.
 *
 * @param {Object} props
 * @param {'approve'|'comment'|'request_changes'} props.verdict
 * @param {'sm'|'md'} [props.size='md']
 */

import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";

const VERDICT_CONFIG = {
  approve: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]",
    Icon: CheckCircle2,
  },
  comment: {
    label: "Commented",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]",
    Icon: MessageSquare,
  },
  request_changes: {
    label: "Changes Requested",
    className: "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_12px_-3px_rgba(239,68,68,0.3)]",
    Icon: XCircle,
  },
};

export default function Badge({ verdict, size = "md" }) {
  const config = VERDICT_CONFIG[verdict?.toLowerCase()] ?? VERDICT_CONFIG.comment;
  const { label, className, Icon } = config;

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full border font-semibold tracking-wide ${textSize} ${className}`}
    >
      <Icon className={iconSize} strokeWidth={2} />
      {label}
    </span>
  );
}
