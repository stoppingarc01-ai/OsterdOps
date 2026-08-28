"use client";

import React from "react";
import { Box, TrendingUp, DollarSign, Database } from "lucide-react";

export function ModelsTopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Models */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Total Models</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">28</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>12% vs last month</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Box className="w-4 h-4" />
        </div>
      </div>

      {/* Card 2: Active Models */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Models</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">18</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>8% vs last month</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Total Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Total Spend</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">$42,328.64</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>18.6% vs last month</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Total Tokens */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Total Tokens</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">312.6M</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>14.3% vs last month</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Database className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
