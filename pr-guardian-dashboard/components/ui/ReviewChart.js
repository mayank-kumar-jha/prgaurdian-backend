"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09110d]/95 border border-emerald-500/30 rounded-xl p-3 shadow-2xl shadow-black/80 backdrop-blur-md">
        <p className="text-xs font-semibold text-zinc-300 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-zinc-400">{entry.name}:</span>
              </div>
              <span className="font-bold text-white font-mono">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function ReviewChart({ reviews = [], days = 14 }) {
  const data = useMemo(() => {
    const counts = {};

    // Initialize the last `days` days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      counts[dateStr] = { approvals: 0, changesRequested: 0, comments: 0 };
    }

    // Populate counts
    reviews.forEach((review) => {
      const ts = review.reviewedAt || review.createdAt;
      if (!ts) return;
      const d = new Date(ts);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (counts[dateStr]) {
        const v = (review.verdict || "").toLowerCase();
        if (v === "approve" || v === "approved") counts[dateStr].approvals++;
        else if (v === "request_changes" || v === "changes_requested")
          counts[dateStr].changesRequested++;
        else counts[dateStr].comments++;
      }
    });

    return Object.entries(counts).map(([date, stats]) => ({
      date,
      Approvals: stats.approvals,
      "Changes Requested": stats.changesRequested,
      Comments: stats.comments,
    }));
  }, [reviews, days]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#132319"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Approvals"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorApprovals)"
          />
          <Area
            type="monotone"
            dataKey="Changes Requested"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorChanges)"
          />
          <Area
            type="monotone"
            dataKey="Comments"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorComments)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
