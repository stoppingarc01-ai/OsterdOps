"use client";

import React from "react";

export function SpendByProviderCard() {
  const providers = [
    { name: "OpenAI", spend: "$2,450.21", percentage: "56.6%", color: "#dfba82" },
    { name: "Anthropic", spend: "$1,210.43", percentage: "28.0%", color: "#b8860b" },
    { name: "Google Gemini", spend: "$412.32", percentage: "9.5%", color: "#9da1b2" },
    { name: "Other Models", spend: "$164.34", percentage: "4.5%", color: "#3b82f6" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Provider</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* OpenAI Arc (56.6%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="14"
              strokeDasharray="135 238"
              strokeDashoffset="0"
            />
            {/* Anthropic Arc (28.0%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#b8860b"
              strokeWidth="14"
              strokeDasharray="67 238"
              strokeDashoffset="-137"
            />
            {/* Google Gemini Arc (9.5%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#9da1b2"
              strokeWidth="14"
              strokeDasharray="23 238"
              strokeDashoffset="-206"
            />
            {/* Other Models Arc (4.5%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="11 238"
              strokeDashoffset="-230"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="absolute text-center">
            <div className="text-[13px] font-bold text-white leading-none">
              $4,328.64
            </div>
            <div className="text-[9.5px] text-[#73788c] mt-0.5">Total</div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2.5 w-full">
          {providers.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-[#c5c9d6] font-medium">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{p.spend}</span>
                <span className="text-[10.5px] text-[#73788c] w-9 text-right font-mono">
                  {p.percentage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
