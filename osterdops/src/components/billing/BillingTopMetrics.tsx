"use client";

import React from "react";
import { Wallet, TrendingDown, ShieldCheck, CreditCard } from "lucide-react";

export function BillingTopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Current Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Current Month AI Spend</span>
          <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">$42,328.64</div>
          <div className="flex items-center justify-between text-[10.5px] text-[#73788c] mt-1">
            <span>Limit: $65,000.00</span>
            <span className="text-[#dfba82] font-semibold">65.1% used</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden">
          <div className="h-full bg-[#dfba82] rounded-full w-[65.1%]" />
        </div>
      </div>

      {/* Card 2: Projected Month-End */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Projected Month-End</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">$58,400.00</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>$6,600 under ceiling cap</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <TrendingDown className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Active Budget Caps */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Budget Enforcements</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">8 Enforced Caps</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>0 Breached · 1 Warning (90%)</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Enterprise Plan Tier */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Subscription</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">Growth Tier</div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>$149/mo · Renews May 25, 2025</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
