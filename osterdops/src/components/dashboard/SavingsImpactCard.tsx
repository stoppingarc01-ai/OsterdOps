"use client";

import React from "react";

export function SavingsImpactCard() {
  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-[#f4efe6]">
          Savings Impact <span className="text-xs text-[#8e93a6] font-normal">(Next 30 Days)</span>
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-white">$1,284.36</span>
          <span className="text-[11px] text-[#73788c]">Total Potential Savings</span>
        </div>
      </div>

      {/* Dual Bar Chart */}
      <div className="h-28 w-full flex items-end justify-around pt-2 border-b border-[#171a27] pb-2">
        {/* May 10 Group */}
        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
          <div className="flex items-end gap-1.5 h-20">
            <div className="w-4 bg-[#b8860b] rounded-t-sm h-[75%]" title="Current Spend" />
            <div className="w-4 bg-[#dfba82] rounded-t-sm h-[45%]" title="Optimized Spend" />
          </div>
          <span className="text-[10.5px] text-[#6e7387]">May 10</span>
        </div>

        {/* May 13 Group */}
        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
          <div className="flex items-end gap-1.5 h-20">
            <div className="w-4 bg-[#b8860b] rounded-t-sm h-[90%]" title="Current Spend" />
            <div className="w-4 bg-[#dfba82] rounded-t-sm h-[55%]" title="Optimized Spend" />
          </div>
          <span className="text-[10.5px] text-[#6e7387]">May 13</span>
        </div>

        {/* May 16 Group */}
        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
          <div className="flex items-end gap-1.5 h-20">
            <div className="w-4 bg-[#b8860b] rounded-t-sm h-[100%]" title="Current Spend" />
            <div className="w-4 bg-[#dfba82] rounded-t-sm h-[60%]" title="Optimized Spend" />
          </div>
          <span className="text-[10.5px] text-[#6e7387]">May 16</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-[#8e93a6]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#b8860b]" />
          <span>Current Spend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#dfba82]" />
          <span>Optimized Spend</span>
        </div>
      </div>
    </div>
  );
}
