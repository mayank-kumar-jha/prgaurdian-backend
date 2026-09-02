"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Hash } from "lucide-react";

const CATEGORY_ORDER = [
  "Security",
  "Bugs",
  "Performance",
  "Style",
  "Test Coverage",
];

const SEVERITY_CONFIG = {
  high: {
    label: "High",
    className: "bg-red-500/12 text-red-400 border-red-500/25",
    dotColor: "bg-red-400",
    border: "border-l-red-400/60",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    dotColor: "bg-amber-400",
    border: "border-l-amber-400/60",
  },
  low: {
    label: "Low",
    className: "bg-zinc-700/60 text-zinc-400 border-zinc-600/40",
    dotColor: "bg-zinc-500",
    border: "border-l-zinc-600/40",
  },
};

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity?.toLowerCase()] ?? SEVERITY_CONFIG.low;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

function CategorySection({ category, comments, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors duration-150 group"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        )}
        <span className="text-xs font-semibold text-zinc-300 flex-1 text-left">
          {category}
        </span>
        <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </button>

      {/* Comments */}
      {open && (
        <div className="divide-y divide-zinc-800/60">
          {comments.map((comment, idx) => {
            const severity = (comment.severity ?? "low").toLowerCase();
            const severityCfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.low;
            const id = comment.id ?? comment._id ?? idx;
            const body = comment.message ?? comment.body ?? "";
            const filePath = comment.filePath ?? comment.file ?? "";
            const line = comment.line;

            return (
              <div
                key={id}
                className={`border-l-2 ${severityCfg.border}`}
              >
                {/* File + line header */}
                {filePath && (
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800/60 bg-zinc-800/20">
                    <FileCode2 className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                    <code className="text-[11px] text-zinc-400 font-mono flex-1 truncate">
                      {filePath}
                    </code>
                    {line != null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-zinc-600 flex-shrink-0">
                        <Hash className="w-2.5 h-2.5" />
                        {line}
                      </span>
                    )}
                    <SeverityBadge severity={comment.severity} />
                  </div>
                )}
                {/* Comment body */}
                <div className="px-4 py-3.5">
                  {!filePath && (
                    <div className="flex items-center justify-between mb-2">
                      <SeverityBadge severity={comment.severity} />
                    </div>
                  )}
                  <p className="text-sm text-zinc-300 leading-relaxed">{body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * CategorizedComments — Groups review comments by category with collapsible
 * sections and severity-colored badges.
 *
 * @param {Object} props
 * @param {Array} props.comments
 */
export default function CategorizedComments({ comments = [] }) {
  if (!comments.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
        <p className="text-sm text-zinc-500">
          No inline comments — the AI left only a top-level review.
        </p>
      </div>
    );
  }

  // Group by category, preserving CATEGORY_ORDER for known ones
  const grouped = {};
  comments.forEach((c) => {
    const cat = c.category ?? "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });

  // Sort categories: known order first, then any extra
  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="space-y-3">
      {sortedCategories.map((cat, idx) => (
        <CategorySection
          key={cat}
          category={cat}
          comments={grouped[cat]}
          defaultOpen={idx === 0}
        />
      ))}
    </div>
  );
}
