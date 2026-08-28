"use client";

import React from "react";

export function OptimizationScoreBreakdownCard() {
  const metrics = [
    { name: "Cost Efficiency", score: 82 },
    { name: "Model Efficiency", score: 76 },
    { name: "Token Efficiency", score: 71 },
    { name: "Budget Adherence", score: 83 },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">
        Optimization Score Breakdown
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Large Donut Ring SVG */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#171a27"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="10"
              strokeDasharray="186 238"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-extrabold text-white leading-none">
              78
            </div>
            <div className="text-[10px] text-[#73788c] mt-0.5 font-medium">/100</div>
          </div>
        </div>

        {/* 4 Metric Progress Bars */}
        <div className="flex-1 space-y-3 w-full">
          {metrics.map((m) => (
            <div key={m.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#c5c9d6] font-medium">{m.name}</span>
                <span className="text-white font-bold font-mono">{m.score}/100</span>
              </div>
              <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#dfba82] rounded-full transition-all duration-300"
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
