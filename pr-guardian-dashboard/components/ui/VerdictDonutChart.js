"use client";

import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = {
  Approved: "#10b981",
  "Changes Requested": "#ef4444",
  Commented: "#f59e0b",
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#09110d]/95 border border-emerald-500/30 rounded-xl p-2.5 shadow-xl shadow-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-zinc-300 font-medium">{data.name}:</span>
          <span className="font-bold text-white font-mono">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function VerdictDonutChart({ reviews = [] }) {
  const { chartData, total } = useMemo(() => {
    let approved = 0;
    let changes = 0;
    let comments = 0;

    reviews.forEach((r) => {
      const v = (r.verdict || "").toLowerCase();
      if (v === "approve" || v === "approved") approved++;
      else if (v === "request_changes" || v === "changes_requested") changes++;
      else comments++;
    });

    const totalCount = reviews.length || 0;
    if (totalCount === 0) {
      return {
        chartData: [{ name: "No Reviews", value: 1, fill: "#1f2937" }],
        total: 0,
      };
    }

    const data = [
      { name: "Approved", value: approved, fill: COLORS.Approved },
      { name: "Changes Requested", value: changes, fill: COLORS["Changes Requested"] },
      { name: "Commented", value: comments, fill: COLORS.Commented },
    ].filter((item) => item.value > 0);

    return { chartData: data, total: totalCount };
  }, [reviews]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-64 relative">
      <div className="w-full h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              stroke="#070d0a"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white font-mono">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Reviews
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Approve</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Changes</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Comment</span>
        </div>
      </div>
    </div>
  );
}
