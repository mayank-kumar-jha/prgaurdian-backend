"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const CATEGORY_COLORS = {
  Security: "#ef4444",
  Bugs: "#f97316",
  Performance: "#eab308",
  Style: "#3b82f6",
  "Test Coverage": "#10b981",
  General: "#8b5cf6",
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09110d]/95 border border-emerald-500/30 rounded-xl p-2.5 shadow-xl shadow-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-300 font-medium">{label}:</span>
          <span className="font-bold text-white font-mono">{payload[0].value} findings</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function CategoryBarChart({ reviews = [] }) {
  const data = useMemo(() => {
    const counts = {
      Security: 0,
      Bugs: 0,
      Performance: 0,
      Style: 0,
      "Test Coverage": 0,
      General: 0,
    };

    reviews.forEach((r) => {
      if (Array.isArray(r.comments)) {
        r.comments.forEach((c) => {
          const rawCat = c.category;
          if (rawCat && counts[rawCat] !== undefined) {
            counts[rawCat]++;
          } else if (rawCat) {
            counts[rawCat] = (counts[rawCat] || 0) + 1;
          } else {
            // Uncategorized comments from AI
            counts.General++;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        fill: CATEGORY_COLORS[category] || "#10b981",
      }))
      .filter((item) => item.category !== "General" || item.count > 0);
  }, [reviews]);

  const totalFindings = data.reduce((acc, d) => acc + d.count, 0);

  if (totalFindings === 0 && reviews.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-zinc-500">No review findings recorded yet</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`bar-cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
