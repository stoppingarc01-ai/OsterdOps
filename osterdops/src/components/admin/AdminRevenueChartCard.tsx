"use client";

import React from "react";
import { TrendingUp, DollarSign } from "lucide-react";

export function AdminRevenueChartCard() {
  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-[#161a26]">
        <div>
          <h3 className="text-base font-bold text-white">Revenue &amp; Incurred Spend Trajectory</h3>
          <p className="text-xs text-[#717688] mt-0.5">Historical MRR and cloud proxy consumption metrics.</p>
        </div>
      </div>

      <div className="p-16 text-center text-xs text-[#73788c] bg-[#080a0f] rounded-xl border border-[#141724] mt-6 space-y-2">
        <div className="w-9 h-9 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="text-white font-semibold">No historical spend series available</div>
        <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
          Revenue telemetry will populate as subscription billing cycles complete.
        </p>
      </div>
    </div>
  );
}
