"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function ModelsSpendByProviderCard() {
  const items = [
    { name: "OpenAI", spend: "$19,932.43", pct: "(47.1%)", color: "#dfba82" },
    { name: "Anthropic", spend: "$11,265.97", pct: "(26.6%)", color: "#b8860b" },
    { name: "Google", spend: "$7,578.64", pct: "(17.9%)", color: "#3b82f6" },
    { name: "AWS Bedrock", spend: "$2,145.67", pct: "(5.1%)", color: "#f59e0b" },
    { name: "Others", spend: "$1,405.93", pct: "(3.3%)", color: "#9da1b2" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Provider</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* OpenAI Arc (47.1%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="14"
              strokeDasharray="112 238"
              strokeDashoffset="0"
            />
            {/* Anthropic Arc (26.6%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#b8860b"
              strokeWidth="14"
              strokeDasharray="63 238"
              strokeDashoffset="-114"
            />
            {/* Google Arc (17.9%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="42 238"
              strokeDashoffset="-179"
            />
            {/* AWS Bedrock Arc (5.1%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
              strokeDasharray="12 238"
              strokeDashoffset="-222"
            />
            {/* Others Arc (3.3%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#9da1b2"
              strokeWidth="14"
              strokeDasharray="8 238"
              strokeDashoffset="-234"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="absolute text-center">
            <div className="text-[13px] font-bold text-white leading-none">
              $42,328.64
            </div>
            <div className="text-[9.5px] text-[#73788c] mt-0.5 font-medium">Total Spend</div>
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
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1"
        >
          <span>View Provider Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
