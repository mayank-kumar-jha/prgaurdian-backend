"use client";

import { ShieldCheck, ShieldAlert, Zap } from "lucide-react";

/**
 * StrictnessSelector — Segmented control for review strictness in deep emerald theme.
 *
 * @param {Object} props
 * @param {'lenient'|'balanced'|'strict'} props.value
 * @param {(value: string) => void} props.onChange
 */

const OPTIONS = [
  {
    value: "lenient",
    label: "Lenient",
    icon: Zap,
    description: "Only flag critical security vulnerabilities and blocking syntax bugs.",
  },
  {
    value: "balanced",
    label: "Balanced",
    icon: ShieldCheck,
    description: "Flag bugs, security, performance risks, and clean code suggestions.",
  },
  {
    value: "strict",
    label: "Strict",
    icon: ShieldAlert,
    description: "Exhaustive review — flags architectural patterns, types, docs, and edge cases.",
  },
];

export default function StrictnessSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;

        return (
          <label
            key={opt.value}
            htmlFor={`strictness-${opt.value}`}
            className={`flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
              isSelected
                ? "bg-gradient-to-b from-emerald-500/15 to-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.25)]"
                : "bg-[#0a120e]/60 border-[#182c20] hover:border-emerald-500/30 hover:bg-[#0e1913]/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-emerald-300" : "text-zinc-200"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                {/* Custom radio indicator */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "border-emerald-400" : "border-zinc-600"
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {opt.description}
              </p>
            </div>

            <input
              id={`strictness-${opt.value}`}
              type="radio"
              name="strictness"
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
}
