"use client";

import React from "react";

export function GovernanceHealthCard() {
  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Governance Health</h3>

      {/* 4 KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        {/* Budgets */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Budgets
          </div>
          <div className="text-xl font-bold text-white">8</div>
          <div className="text-[10.5px] text-[#8e93a6]">Active</div>
        </div>

        {/* Budget Utilization */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Budget Utilization
          </div>
          <div className="text-xl font-bold text-white">63%</div>
          <div className="text-[10.5px] text-[#8e93a6]">Average</div>
        </div>

        {/* Policy Violations */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Policy Violations
          </div>
          <div className="text-xl font-bold text-[#ef4444]">3</div>
          <div className="text-[10.5px] text-[#8e93a6]">Last 7 days</div>
        </div>

        {/* Active Policies */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Active Policies
          </div>
          <div className="text-xl font-bold text-white">12</div>
          <div className="text-[10.5px] text-[#8e93a6]">Enforced</div>
        </div>
      </div>

      {/* Governance Score Bar */}
      <div className="pt-2 border-t border-[#171a27] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8e93a6] font-medium">Overall Governance Score</span>
          <span className="text-white font-bold font-mono">78/100</span>
        </div>
        <div className="w-full h-2 bg-[#141724] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#dfba82] to-[#b8860b] rounded-full w-[78%]" />
        </div>
      </div>
    </div>
  );
}
