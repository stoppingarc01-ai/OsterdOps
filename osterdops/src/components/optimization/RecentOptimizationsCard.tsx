"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export function RecentOptimizationsCard() {
  const items = [
    {
      title: "Routed 2,456 GPT-4o calls to GPT-4o-mini",
      saved: "Saved $168.42",
      time: "2h ago",
    },
    {
      title: "Compressed prompts in Customer Support flow",
      saved: "Saved $78.11",
      time: "5h ago",
    },
    {
      title: "Enabled caching for FAQ responses",
      saved: "Saved $64.32",
      time: "1d ago",
    },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Recent Optimizations</h3>
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#e8eaf0] tracking-tight">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#4ade80] font-medium mt-0.5">
                  {item.saved}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#73788c] shrink-0 group-hover:text-white transition-colors">
              <span>{item.time}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
