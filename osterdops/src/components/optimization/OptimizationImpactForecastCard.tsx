"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export function OptimizationImpactForecastCard() {
  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Optimization Impact Forecast
          </h3>
          <p className="text-xs text-[#8e93a6] mt-0.5">
            Projected savings if recommended optimizations are implemented.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121422] border border-[#1f2233] text-xs text-[#c5c9d6] cursor-pointer hover:border-[#dfba82]/30 transition-colors">
          <span>Next 3 Months</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
        </div>
      </div>

      {/* Legend Top */}
      <div className="flex items-center gap-6 text-xs text-[#8e93a6] pt-1">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#dfba82]" />
          <span>Current Spend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t border-dashed border-[#dfba82]" />
          <span>Optimized Spend (Projected)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#4ade80]" />
          <span>Potential Savings</span>
        </div>
      </div>

      {/* SVG Forecast Graph */}
      <div className="h-64 w-full relative pt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220">
          {/* Y Axis Grid */}
          {[0, 44, 88, 132, 176, 220].map((yVal, i) => (
            <line
              key={i}
              x1="50"
              y1={yVal}
              x2="720"
              y2={yVal}
              stroke="#1b1e2c"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y Axis Labels */}
          <text x="0" y="10" fill="#6e7387" fontSize="10">$10K</text>
          <text x="0" y="54" fill="#6e7387" fontSize="10">$8K</text>
          <text x="0" y="98" fill="#6e7387" fontSize="10">$6K</text>
          <text x="0" y="142" fill="#6e7387" fontSize="10">$4K</text>
          <text x="0" y="186" fill="#6e7387" fontSize="10">$2K</text>
          <text x="0" y="218" fill="#6e7387" fontSize="10">$0</text>

          {/* Solid Line: Current Spend */}
          <path
            d="M 80,140 L 270,115 L 460,95 L 650,80"
            fill="none"
            stroke="#dfba82"
            strokeWidth="2.5"
          />

          {/* Dashed Line: Optimized Spend */}
          <path
            d="M 80,175 L 270,150 L 460,135 L 650,125"
            fill="none"
            stroke="#dfba82"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Nodes & Value Tooltip Pills for Current Spend */}
          <g>
            <circle cx="80" cy="140" r="4" fill="#dfba82" />
            <text x="80" y="130" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">$4,328</text>

            <circle cx="270" cy="115" r="4" fill="#dfba82" />
            <text x="270" y="105" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">$5,247</text>

            <circle cx="460" cy="95" r="4" fill="#dfba82" />
            <text x="460" y="85" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">$5,982</text>

            <circle cx="650" cy="80" r="4" fill="#dfba82" />
            <text x="650" y="70" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">$6,421</text>
          </g>

          {/* Nodes & Value Tooltip Pills for Optimized Spend */}
          <g>
            <circle cx="80" cy="175" r="3.5" fill="#dfba82" />
            <text x="80" y="193" fill="#dfba82" fontSize="10" fontWeight="bold" textAnchor="middle">$3,214</text>

            <circle cx="270" cy="150" r="3.5" fill="#dfba82" />
            <text x="270" y="168" fill="#dfba82" fontSize="10" fontWeight="bold" textAnchor="middle">$3,781</text>

            <circle cx="460" cy="135" r="3.5" fill="#dfba82" />
            <text x="460" y="153" fill="#dfba82" fontSize="10" fontWeight="bold" textAnchor="middle">$4,296</text>

            <circle cx="650" cy="125" r="3.5" fill="#dfba82" />
            <text x="650" y="143" fill="#dfba82" fontSize="10" fontWeight="bold" textAnchor="middle">$4,587</text>
          </g>

          {/* Callout Labels on the Right */}
          <text x="665" y="75" fill="#dfba82" fontSize="10" fontWeight="bold">$6,443 (23%)</text>
          <text x="665" y="115" fill="#4ade80" fontSize="10" fontWeight="bold">$2,145 (23%)</text>
          <text x="665" y="135" fill="#dfba82" fontSize="10" fontWeight="bold">$2,698 (23%)</text>
        </svg>

        {/* X Axis Labels */}
        <div className="flex items-center justify-around text-[11px] text-[#6e7387] px-8 pt-1">
          <span>May 10 - May 31</span>
          <span>Jun 1 - Jun 30</span>
          <span>Jul 1 - Jul 31</span>
          <span>Aug 1 - Aug 31</span>
        </div>
      </div>
    </div>
  );
}
