"use client";

import React from "react";
import { DollarSign, Percent, Layers, LineChart, TrendingUp } from "lucide-react";

export function ReportsTopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Total Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Total Spend</span>
          <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-white tracking-tight">$42,328.64</div>
          <div className="flex items-center gap-1 text-[10.5px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>18.6% vs last period</span>
          </div>
        </div>
        {/* SVG Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M0,20 Q20,15 40,18 T80,8 T100,2"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Total Savings */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Total Savings</span>
          <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-white tracking-tight">$7,842.18</div>
          <div className="flex items-center gap-1 text-[10.5px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>23.4% vs last period</span>
          </div>
        </div>
        {/* SVG Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M0,22 Q25,18 50,12 T80,6 T100,2"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: Total Requests */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Total Requests</span>
          <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#3b82f6]">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-white tracking-tight">1.24M</div>
          <div className="flex items-center gap-1 text-[10.5px] text-[#3b82f6] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>12.8% vs last period</span>
          </div>
        </div>
        {/* SVG Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M0,20 Q30,12 60,16 T100,4"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Card 4: Avg. Cost / 1K Tokens */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Avg. Cost / 1K Tokens</span>
          <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#f59e0b]">
            <LineChart className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-white tracking-tight">$0.092</div>
          <div className="flex items-center gap-1 text-[10.5px] text-[#f59e0b] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>9.7% vs last period</span>
          </div>
        </div>
        {/* SVG Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M0,18 Q30,10 60,14 T100,5"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Card 5: Optimization Score Gauge (Matching User Image 100%) */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all">
        {/* Left Side: Title, Score 78/100, Trend */}
        <div className="flex flex-col justify-between h-full space-y-2">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#73788c]">
              <span>Optimization Score</span>
              <span className="text-[10px] text-[#73788c]">↗</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">78</span>
              <span className="text-xs font-mono text-[#73788c]">/100</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10.5px] text-[#4ade80] font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>8 pts vs last period</span>
          </div>
        </div>

        {/* Right Side: Circular Gauge Ring */}
        <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Track */}
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#161928"
              strokeWidth="4.5"
            />
            {/* Active Gold Arc (78%) */}
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#dfba82"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="68.6 88"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
