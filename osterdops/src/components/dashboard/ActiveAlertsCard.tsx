"use client";

import React from "react";
import { ShieldAlert, Zap, Activity } from "lucide-react";

export function ActiveAlertsCard() {
  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Active Alerts</h3>
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </button>
      </div>

      {/* Alert Cards Stack */}
      <div className="space-y-3">
        {/* Alert 1: Budget at 82% */}
        <div className="p-3.5 bg-[#14121a] border border-[#2e1a22] rounded-xl space-y-2.5 hover:border-[#ef4444]/40 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold text-[#f87171]">Budget at 82%</h4>
                <span className="text-[10px] font-bold text-[#ef4444]">82%</span>
              </div>
              <p className="text-[11.5px] text-[#9ca3af] mt-0.5 leading-snug">
                Monthly budget &quot;Production&quot; is at 82% of $5,000
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#261820] rounded-full overflow-hidden">
            <div className="h-full bg-[#ef4444] rounded-full w-[82%]" />
          </div>
        </div>

        {/* Alert 2: Spike Detected */}
        <div className="p-3.5 bg-[#171415] border border-[#2d2218] rounded-xl flex items-start gap-3 hover:border-[#f59e0b]/40 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#fbbf24]">Spike Detected</h4>
            <p className="text-[11.5px] text-[#9ca3af] mt-0.5 leading-snug">
              Anthropic usage increased by <span className="text-[#f59e0b] font-semibold">240%</span> in the last 6 hours
            </p>
          </div>
        </div>

        {/* Alert 3: Model Anomaly */}
        <div className="p-3.5 bg-[#111522] border border-[#1b253b] rounded-xl flex items-start gap-3 hover:border-[#3b82f6]/40 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shrink-0 mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#60a5fa]">Model Anomaly</h4>
            <p className="text-[11.5px] text-[#9ca3af] mt-0.5 leading-snug">
              High token usage from <span className="text-white font-medium">gpt-4o</span> for user_user_8921
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
