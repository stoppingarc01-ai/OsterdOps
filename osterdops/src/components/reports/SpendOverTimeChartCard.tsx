"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function SpendOverTimeChartCard() {
  const [timeframe, setTimeframe] = useState("Daily");

  const dates = ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15", "May 16"];
  const ticks = ["$6K", "$5K", "$4K", "$3K", "$2K", "$1K", "$0"];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#f4efe6]">Spend Over Time</h3>
          <p className="text-xs text-[#8e93a6] mt-0.5">Daily total spend across all providers</p>
        </div>

        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-[#121422] border border-[#232738] rounded-xl px-3 py-1.5 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-7 font-medium"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#73788c] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative h-64 w-full flex items-end pt-4">
        {/* Y-Axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10.5px] font-mono text-[#5d6275]">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Chart Canvas Area */}
        <div className="ml-9 w-full h-full flex flex-col justify-between relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((t, idx) => (
              <div key={idx} className="w-full border-b border-[#161826]/80 h-0" />
            ))}
          </div>

          {/* SVG Smooth Curve */}
          <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="reportsSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dfba82" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#dfba82" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Filled Gradient Area */}
            <path
              d="M0,130 C100,160 200,110 300,80 C400,100 500,85 600,60 L700,30 L700,200 L0,200 Z"
              fill="url(#reportsSpendGrad)"
            />

            {/* Main Smooth Line */}
            <path
              d="M0,130 C100,160 200,110 300,80 C400,100 500,85 600,60 L700,30"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            <circle cx="0" cy="130" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="116" cy="160" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="233" cy="110" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="350" cy="80" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="466" cy="100" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="583" cy="60" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
            <circle cx="700" cy="30" r="4" fill="#dfba82" stroke="#0d0f18" strokeWidth="2" />
          </svg>

          {/* X-Axis Labels */}
          <div className="flex justify-between text-[11px] font-medium text-[#73788c] pt-2 border-t border-[#171a27]">
            {dates.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
