"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function SpendByTeamCard() {
  const teams = [
    { name: "AI Core", spend: "$16,085.12", pct: "(38.0%)", color: "#dfba82" },
    { name: "ML Ops", spend: "$10,158.87", pct: "(24.0%)", color: "#b8860b" },
    { name: "Product AI", spend: "$7,619.15", pct: "(18.0%)", color: "#3b82f6" },
    { name: "Data Platform", spend: "$5,079.44", pct: "(12.0%)", color: "#10b981" },
    { name: "Growth AI", spend: "$3,386.06", pct: "(8.0%)", color: "#8b5cf6" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Team</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* AI Core Arc (38%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="14"
              strokeDasharray="90 238"
              strokeDashoffset="0"
            />
            {/* ML Ops Arc (24%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#b8860b"
              strokeWidth="14"
              strokeDasharray="57 238"
              strokeDashoffset="-92"
            />
            {/* Product AI Arc (18%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="43 238"
              strokeDashoffset="-151"
            />
            {/* Data Platform Arc (12%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeDasharray="29 238"
              strokeDashoffset="-196"
            />
            {/* Growth AI Arc (8%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="14"
              strokeDasharray="19 238"
              strokeDashoffset="-227"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="absolute text-center">
            <div className="text-[13px] font-bold text-white leading-none">
              $42,328.64
            </div>
            <div className="text-[9.5px] text-[#73788c] mt-0.5 font-medium">Team Total</div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 w-full">
          {teams.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#c5c9d6] font-medium text-[11.5px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-white font-semibold text-[11.5px]">{item.spend}</span>
                <span className="text-[10px] text-[#73788c]">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#171a27] text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Team Allocations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
