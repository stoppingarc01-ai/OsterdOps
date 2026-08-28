"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function TopDevelopersLeaderboardCard() {
  const developers = [
    { rank: 1, name: "Shaan Prasad", team: "AI Core", spend: "$12,450.21", budget: "$15,000", pct: "83%", barColor: "from-[#b8860b] to-[#dfba82]" },
    { rank: 2, name: "Elena Rostova", team: "ML Ops", spend: "$9,120.43", budget: "$12,000", pct: "76%", barColor: "from-[#3b82f6] to-[#60a5fa]" },
    { rank: 3, name: "Marcus Chen", team: "Product AI", spend: "$6,890.12", budget: "$10,000", pct: "68%", barColor: "from-[#8b5cf6] to-[#a78bfa]" },
    { rank: 4, name: "Aisha Patel", team: "Data Platform", spend: "$5,421.32", budget: "$8,000", pct: "67%", barColor: "from-[#10b981] to-[#34d399]" },
    { rank: 5, name: "David Kim", team: "Growth AI", spend: "$3,210.50", budget: "$5,000", pct: "64%", barColor: "from-[#dfba82] to-[#f3ebd9]" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Developer Spenders</h3>
        <button type="button" className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {developers.map((dev) => (
          <div key={dev.rank} className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl space-y-2 hover:border-[#dfba82]/30 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 font-mono font-bold text-[#73788c]">{dev.rank}</span>
                <span className="font-semibold text-white tracking-tight">{dev.name}</span>
                <span className="text-[10px] text-[#73788c] bg-[#171a29] px-1.5 py-0.5 rounded border border-[#23273c]">
                  {dev.team}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-white text-[11.5px]">{dev.spend}</span>
                <span className="text-[10px] text-[#73788c]">/ {dev.budget}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${dev.barColor} rounded-full transition-all duration-500`}
                style={{ width: dev.pct }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#171a27] text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Detailed Limits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
