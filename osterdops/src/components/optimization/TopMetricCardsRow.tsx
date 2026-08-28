"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpRight, Trash2, Scale, TrendingUp } from "lucide-react";

export function TopMetricCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Total Potential Savings */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Potential Savings</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $1,284.36
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>22.4% of current spend</span>
          </div>
        </div>

        {/* Mini Gold Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,20 Q 25,12 50,15 T 100,2 L 100,25 L 0,25 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,20 Q 25,12 50,15 T 100,2"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Savings Achievable */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Savings Achievable</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#4ade80]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $742.18
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>This month</span>
          </div>
        </div>

        {/* Mini Green Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,22 Q 30,10 60,14 T 100,3 L 100,25 L 0,25 Z"
              fill="rgba(74, 222, 128, 0.12)"
            />
            <path
              d="M 0,22 Q 30,10 60,14 T 100,3"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: Optimization Score Gauge */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#73788c]">
            <span>Optimization Score</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#73788c]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">78</span>
            <span className="text-xs text-[#73788c] font-medium">/100</span>
          </div>
        </div>

        {/* Arc gauge SVG */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#171a27]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#dfba82]"
              strokeDasharray="78, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>

      {/* Card 4: Waste Identified */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Waste Identified</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82]">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $542.32
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>12.6% of spend</span>
          </div>
        </div>

        {/* Mini Gold Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,18 Q 30,14 60,10 T 100,4 L 100,25 L 0,25 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,18 Q 30,14 60,10 T 100,4"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 5: ROI Impact (Est.) */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>ROI Impact (Est.)</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82]">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            8.7x
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Return on optimization</span>
          </div>
        </div>

        {/* Mini Gold Sparkline */}
        <div className="h-6 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,20 Q 25,15 50,8 T 100,2 L 100,25 L 0,25 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,20 Q 25,15 50,8 T 100,2"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
