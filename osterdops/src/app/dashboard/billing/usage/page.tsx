"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Layers, Sparkles, TrendingUp } from "lucide-react";

export default function BillingUsagePage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  Metering & Billing Records
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Metered Token Usage & Entitlements
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs text-[#8e93a6] mb-1">Total Metered Tokens</div>
                <div className="text-2xl font-bold text-[#f4efe6]">2,450,000</div>
                <div className="text-[11px] text-[#73788c] mt-2">1,850k Prompt | 600k Completion</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs text-[#8e93a6] mb-1">Plan Token Allowance</div>
                <div className="text-2xl font-bold text-[#dfba82]">10,000,000</div>
                <div className="text-[11px] text-emerald-400 mt-2">24.5% utilized (7.55M remaining)</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs text-[#8e93a6] mb-1">Overage Token Rate</div>
                <div className="text-2xl font-bold text-[#f4efe6]">$0.002 / 1k</div>
                <div className="text-[11px] text-[#73788c] mt-2">Standard integer-cents rate</div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
