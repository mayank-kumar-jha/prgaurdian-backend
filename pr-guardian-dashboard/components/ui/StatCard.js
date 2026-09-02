/**
 * StatCard — Dashboard summary card with deep green glowing gradients.
 *
 * @param {Object} props
 * @param {import('lucide-react').LucideIcon} props.icon
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.sub] - Optional subtitle/trend text
 * @param {string} [props.trend] - 'up' | 'down' | 'neutral'
 * @param {string} [props.accentColor] - emerald | teal | cyan | violet
 */

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_CONFIG = {
  up: { Icon: TrendingUp, className: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" },
  down: { Icon: TrendingDown, className: "text-red-400 bg-red-950/40 border-red-500/20" },
  neutral: { Icon: Minus, className: "text-zinc-500 bg-zinc-900/40 border-zinc-800" },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend = "neutral",
  iconColor = "text-emerald-400",
  iconBg = "bg-emerald-500/10 border-emerald-500/20",
}) {
  const trendCfg = TREND_CONFIG[trend] ?? TREND_CONFIG.neutral;

  return (
    <div className="relative group">
      {/* Outer ambient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 to-teal-800/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card body */}
      <div className="relative bg-gradient-to-b from-[#0e1913]/90 to-[#070e0a]/95 border border-[#182c20] group-hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 shadow-xl shadow-black/40">
        {/* Top: label + icon */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {label}
          </span>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${iconBg}`}>
            <Icon className={`w-4.5 h-4.5 ${iconColor}`} strokeWidth={1.8} />
          </div>
        </div>

        {/* Value & sub metric */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-none">
            {value}
          </span>
          {sub && (
            <div
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${trendCfg.className}`}
            >
              <trendCfg.Icon className="w-3 h-3" />
              <span>{sub}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
