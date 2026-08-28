"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export function TopSpendIncreaseCard() {
  const items = [
    { rank: 1, name: "GPT-4o", increase: "+ $1,245.32", pct: "(15.6%)" },
    { rank: 2, name: "Gemini 1.5 Flash", increase: "+ $52.11", pct: "(6.4%)" },
    { rank: 3, name: "Claude 3.5 Sonnet", increase: "+ $210.43", pct: "(4.2%)" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Spend Increase</h3>
        <button type="button" className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82]">
          View All
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.rank}
            className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-[#73788c]">{item.rank}</span>
              <span className="text-xs font-semibold text-white tracking-tight">{item.name}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-[#dfba82] font-bold">
              <TrendingUp className="w-3 h-3 text-[#dfba82]" />
              <span>{item.increase}</span>
              <span className="text-[10px] text-[#73788c] font-normal">{item.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
