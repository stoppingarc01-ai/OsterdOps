"use client";

import React from "react";

export function WasteBreakdownCard() {
  const items = [
    { name: "Over-provisioned Models", amount: "$198.21", pct: "(36%)", color: "#ef4444" },
    { name: "Excessive Tokens", amount: "$142.11", pct: "(26%)", color: "#f59e0b" },
    { name: "Unused Context", amount: "$98.76", pct: "(18%)", color: "#dfba82" },
    { name: "Inefficient Routing", amount: "$64.32", pct: "(12%)", color: "#4ade80" },
    { name: "Other", amount: "$38.92", pct: "(8%)", color: "#9da1b2" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Waste Breakdown</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Over-provisioned Models Arc (36%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ef4444"
              strokeWidth="14"
              strokeDasharray="85 238"
              strokeDashoffset="0"
            />
            {/* Excessive Tokens Arc (26%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
              strokeDasharray="62 238"
              strokeDashoffset="-87"
            />
            {/* Unused Context Arc (18%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="14"
              strokeDasharray="43 238"
              strokeDashoffset="-151"
            />
            {/* Inefficient Routing Arc (12%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#4ade80"
              strokeWidth="14"
              strokeDasharray="28 238"
              strokeDashoffset="-196"
            />
            {/* Other Arc (8%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#9da1b2"
              strokeWidth="14"
              strokeDasharray="19 238"
              strokeDashoffset="-226"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="absolute text-center">
            <div className="text-[13px] font-bold text-white leading-none">
              $542.32
            </div>
            <div className="text-[9.5px] text-[#73788c] mt-0.5 font-medium">Total Waste</div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 w-full">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#c5c9d6] font-medium text-[11.5px] truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold font-mono text-[11.5px]">{item.amount}</span>
                <span className="text-[10px] text-[#73788c] font-mono">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
