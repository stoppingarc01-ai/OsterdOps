"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function ModelEfficiencyLeaderboardCard() {
  const items = [
    { rank: 1, rankBg: "bg-[#dfba82] text-[#090a0f]", name: "GPT-4o-mini", cost: "$0.055", score: "92/100" },
    { rank: 2, rankBg: "bg-[#9da1b2] text-[#090a0f]", name: "Claude 3 Haiku", cost: "$0.082", score: "88/100" },
    { rank: 3, rankBg: "bg-[#b8860b] text-white", name: "Gemini 1.5 Flash", cost: "$0.046", score: "86/100" },
    { rank: 4, rankBg: "bg-[#181b2a] border border-[#2e334a] text-[#8e93a6]", name: "Llama 3.1 70B", cost: "$0.123", score: "72/100" },
    { rank: 5, rankBg: "bg-[#181b2a] border border-[#2e334a] text-[#8e93a6]", name: "GPT-4o", cost: "$0.139", score: "68/100" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">
          Model Efficiency Leaderboard
        </h3>
        <button type="button" className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82]">
          View All
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.rank}
            className="p-2.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${item.rankBg}`}
              >
                {item.rank}
              </div>
              <span className="text-xs font-semibold text-[#e8eaf0] tracking-tight">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#8e93a6]">{item.cost}</span>
              <span className="text-white font-bold">{item.score}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#171a27] text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1"
        >
          <span>View Full Leaderboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
