"use client";

import React from "react";

export function TopProjectsBySpendCard() {
  const projects = [
    { rank: 1, name: "Customer Support AI", spend: "$12,432.21", pct: "29.4%", barWidth: "75%" },
    { rank: 2, name: "Code Assistant", spend: "$9,876.45", pct: "23.3%", barWidth: "60%" },
    { rank: 3, name: "Data Analysis", spend: "$7,654.32", pct: "18.1%", barWidth: "48%" },
    { rank: 4, name: "Marketing Content", spend: "$6,321.18", pct: "14.9%", barWidth: "38%" },
    { rank: 5, name: "Research & Insights", spend: "$3,984.48", pct: "9.4%", barWidth: "24%" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Projects by Spend</h3>
        <button type="button" className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82]">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => (
          <div key={proj.rank} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 text-center font-mono font-bold text-[#73788c]">{proj.rank}</span>
                <span className="font-semibold text-white tracking-tight">{proj.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-white text-[11.5px]">{proj.spend}</span>
                <span className="text-[10px] text-[#73788c]">{proj.pct}</span>
              </div>
            </div>
            {/* Gold Progress Bar */}
            <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden ml-6 max-w-[calc(100%-1.5rem)]">
              <div
                className="h-full bg-gradient-to-r from-[#b8860b] to-[#dfba82] rounded-full transition-all duration-500"
                style={{ width: proj.barWidth }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
