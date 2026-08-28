"use client";

import React, { useState } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";

export function AISpendChartCard() {
  const [activeTab, setActiveTab] = useState<"Spend" | "Tokens" | "Requests">("Spend");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = [
    { date: "Apr 17", value: 120, formatted: "$120" },
    { date: "Apr 21", value: 240, formatted: "$240" },
    { date: "Apr 25", value: 680, formatted: "$680" },
    { date: "Apr 29", value: 450, formatted: "$450" },
    { date: "May 3",  value: 910, formatted: "$910" },
    { date: "May 7",  value: 580, formatted: "$580" },
    { date: "May 11", value: 980, formatted: "$980" },
    { date: "May 15", value: 820, formatted: "$820" },
    { date: "May 16", value: 1140, formatted: "$1,140" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between space-y-4">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            AI Spend Over Time
          </h3>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#121422] rounded-xl border border-[#1f2233]">
            {(["Spend", "Tokens", "Requests"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#dfba82] text-[#090a0f] font-bold shadow-xs"
                    : "text-[#8e93a6] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Granularity & Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121422] border border-[#1f2233] text-xs text-[#c5c9d6] cursor-pointer hover:border-[#dfba82]/30 transition-colors">
            <span>Daily</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </div>
          <button
            type="button"
            className="p-1.5 rounded-xl bg-[#121422] border border-[#1f2233] text-[#73788c] hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main SVG Area Line Chart */}
      <div className="h-64 w-full relative pt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220">
          <defs>
            <linearGradient id="mainSpendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dfba82" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#dfba82" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 50, 100, 150, 200].map((yVal, i) => (
            <line
              key={i}
              x1="40"
              y1={yVal}
              x2="780"
              y2={yVal}
              stroke="#1b1e2c"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y Axis Labels */}
          <text x="0" y="10" fill="#6e7387" fontSize="10">$1.2k</text>
          <text x="0" y="60" fill="#6e7387" fontSize="10">$900</text>
          <text x="0" y="110" fill="#6e7387" fontSize="10">$600</text>
          <text x="0" y="160" fill="#6e7387" fontSize="10">$300</text>
          <text x="0" y="210" fill="#6e7387" fontSize="10">$0</text>

          {/* Gradient Filled Area */}
          <path
            d="M 50,195 Q 140,175 230,110 T 410,75 T 590,60 T 770,30 L 770,200 L 50,200 Z"
            fill="url(#mainSpendGradient)"
          />

          {/* Main Gold Line Path */}
          <path
            d="M 50,195 Q 140,175 230,110 T 410,75 T 590,60 T 770,30"
            fill="none"
            stroke="#dfba82"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Data Dots */}
          {[
            { x: 50, y: 195, label: "$120" },
            { x: 140, y: 175, label: "$240" },
            { x: 230, y: 110, label: "$680" },
            { x: 320, y: 145, label: "$450" },
            { x: 410, y: 75, label: "$910" },
            { x: 500, y: 125, label: "$580" },
            { x: 590, y: 60, label: "$980" },
            { x: 680, y: 85, label: "$820" },
            { x: 770, y: 30, label: "$1,140" },
          ].map((pt, index) => (
            <g key={index} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#dfba82"
                stroke="#0d0f18"
                strokeWidth="2"
                className="hover:r-7 transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint === index && (
                <g>
                  <rect
                    x={pt.x - 30}
                    y={pt.y - 32}
                    width="60"
                    height="22"
                    rx="6"
                    fill="#181b2a"
                    stroke="#dfba82"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 17}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* X Axis Dates Row */}
        <div className="flex items-center justify-between text-[11px] text-[#6e7387] px-4 pt-1">
          {chartData.map((d) => (
            <span key={d.date}>{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
