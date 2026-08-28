"use client";

import React from "react";
import { TrendingUp, DollarSign, Cpu, BarChart3, Sparkles } from "lucide-react";

export function StatCardsBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Stat 1: Total Spend (This Month) */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Spend (This Month)</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $4,328.64
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>28.6% vs last month</span>
          </div>
        </div>

        {/* Mini Gold Sparkline Graph */}
        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,25 Q 25,18 50,15 T 100,5 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,25 Q 25,18 50,15 T 100,5"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 2: Projected Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Projected Spend</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $6,712.00
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>35.7% vs last month</span>
          </div>
        </div>

        {/* Mini Gold Sparkline */}
        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,22 Q 30,12 60,18 T 100,4 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,22 Q 30,12 60,18 T 100,4"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 3: Total Tokens */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Tokens</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            312.6M
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>18.2% vs last month</span>
          </div>
        </div>

        {/* Mini Gold Bar Chart */}
        <div className="h-7 w-full mt-3 flex items-end gap-1">
          {[40, 55, 35, 70, 60, 85, 95, 80, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#dfba82]/30 rounded-xs hover:bg-[#dfba82] transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stat 4: Total Requests */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Requests</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            89,732
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>24.1% vs last month</span>
          </div>
        </div>

        {/* Mini Gold Bar Chart */}
        <div className="h-7 w-full mt-3 flex items-end gap-1">
          {[30, 45, 60, 50, 75, 65, 80, 90, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#dfba82]/30 rounded-xs hover:bg-[#dfba82] transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stat 5: Potential Savings */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Potential Savings</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5">
            $1,284.36
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>22.4% if optimized</span>
          </div>
        </div>

        {/* Mini Gold Sparkline */}
        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,28 Q 30,20 60,10 T 100,2 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.15)"
            />
            <path
              d="M 0,28 Q 30,20 60,10 T 100,2"
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
