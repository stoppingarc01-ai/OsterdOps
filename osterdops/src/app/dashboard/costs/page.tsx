"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { BadgeDollarSign, TrendingUp, Sparkles, Wallet, CreditCard, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  Cost Governance
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Cost Center & Spend Attribution
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/budgets"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111422] border border-[#1d2136] text-xs font-semibold hover:border-[#dfba82]/40 transition-all"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#dfba82]" />
                  Budgets
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba82] text-black text-xs font-semibold hover:opacity-90 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Manage Billing
                </Link>
              </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">Current Spend (MTD)</div>
                <div className="text-2xl font-bold text-[#f4efe6]">$142.85</div>
                <div className="text-[11px] text-[#8e93a6] mt-2">Prorated 18,420 requests</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">Estimated Month-End</div>
                <div className="text-2xl font-bold text-[#dfba82]">$195.40</div>
                <div className="text-[11px] text-emerald-400 mt-2">Well within $500.00 org budget</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">Prompt Cache Savings</div>
                <div className="text-2xl font-bold text-emerald-400">$18.50</div>
                <div className="text-[11px] text-[#8e93a6] mt-2">12.9% reduction in raw token cost</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">Average Cost / 1k Reqs</div>
                <div className="text-2xl font-bold text-[#f4efe6]">$7.75</div>
                <div className="text-[11px] text-emerald-400 mt-2">-4.2% vs previous period</div>
              </div>
            </div>

            {/* Cost Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* By Provider */}
              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3">
                <div className="font-semibold text-sm text-[#f4efe6]">Spend by Provider</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">OpenAI</span>
                    <span className="font-bold text-[#dfba82]">$89.20 (62.4%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">Anthropic</span>
                    <span className="font-bold text-[#dfba82]">$41.50 (29.1%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">Google Gemini</span>
                    <span className="font-bold text-[#dfba82]">$12.15 (8.5%)</span>
                  </div>
                </div>
              </div>

              {/* By Model */}
              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3">
                <div className="font-semibold text-sm text-[#f4efe6]">Spend by Model</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="font-mono text-white">gpt-4o</span>
                    <span className="font-bold text-[#dfba82]">$68.40 (47.9%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="font-mono text-white">claude-3-5-sonnet</span>
                    <span className="font-bold text-[#dfba82]">$41.50 (29.1%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="font-mono text-white">gpt-4o-mini</span>
                    <span className="font-bold text-[#dfba82]">$20.80 (14.5%)</span>
                  </div>
                </div>
              </div>

              {/* By Project */}
              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3">
                <div className="font-semibold text-sm text-[#f4efe6]">Spend by Project</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">Customer Support Agent</span>
                    <span className="font-bold text-[#dfba82]">$74.20 (51.9%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">Code Intelligence Assistant</span>
                    <span className="font-bold text-[#dfba82]">$52.30 (36.6%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] flex items-center justify-between text-xs">
                    <span className="text-white">Internal Search Copilot</span>
                    <span className="font-bold text-[#dfba82]">$16.35 (11.5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
