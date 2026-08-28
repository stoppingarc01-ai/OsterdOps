"use client";

import React from "react";
import { Zap, Minimize2, Trash2 } from "lucide-react";

import Link from "next/link";

export function OptimizationOpportunitiesCard() {
  const items = [
    {
      icon: Zap,
      title: "Route 40% of gpt-4o calls to gpt-4o-mini",
      savings: "Save $742/mo",
      impact: "High",
      impactColor: "text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/30",
    },
    {
      icon: Minimize2,
      title: "Compress prompts for claude-3.5-sonnet",
      savings: "Save $312/mo",
      impact: "Medium",
      impactColor: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30",
    },
    {
      icon: Trash2,
      title: "Remove unused context in 12 flows",
      savings: "Save $230/mo",
      impact: "Low",
      impactColor: "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/30",
    },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">
          Optimization Opportunities
        </h3>
        <Link
          href="/optimization"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Items list */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-[#e8eaf0] tracking-tight">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-[#4ade80]">
                  {item.savings}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${item.impactColor}`}
                >
                  {item.impact}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
