"use client";

import React from "react";
import { Activity, ShieldCheck, Globe, Zap } from "lucide-react";

export function LiveTickerBar() {
  return (
    <div className="w-full bg-[#0a0c13] border-b border-[#161824] px-4 py-2 flex items-center justify-between text-[11px] text-[#787d91]">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* Gateway Health */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
          <span className="text-[#c5c9d6] font-medium">Gateway Proxy:</span>
          <span className="text-[#4ade80] font-bold">100% Operational</span>
        </div>

        {/* Edge Locations */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Globe className="w-3 h-3 text-[#dfba82]" />
          <span>14 Edge Nodes</span>
        </div>

        {/* Cache Hit */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3 h-3 text-[#dfba82]" />
          <span>Avg Latency: <strong className="text-white font-mono">42ms</strong></span>
        </div>

        {/* Active SOC2 Guardrails */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3 h-3 text-[#dfba82]" />
          <span>SOC2 Type II Certified</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 shrink-0 text-[10.5px]">
        <span className="text-[#dfba82] font-mono">LIVE SPEND TICKER: $4,328.64</span>
      </div>
    </div>
  );
}
