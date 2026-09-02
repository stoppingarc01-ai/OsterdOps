"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import {
  BadgeDollarSign,
  TrendingUp,
  Sparkles,
  Wallet,
  CreditCard,
  Calendar,
  Layers,
  Cpu,
  FolderKanban,
  Zap,
  Coins,
  Loader2,
  Terminal,
  ArrowRight,
} from "lucide-react";

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState<"mtd" | "30d" | "quarter">("mtd");
  const [activeTab, setActiveTab] = useState<"project" | "provider" | "model">("model");

  const telemetryRange = timeRange === "quarter" ? "90d" : "30d";
  const { data: telemetry, isLoading, isValidating, refetch } = useLiveTelemetry({
    timeRange: telemetryRange,
    pollIntervalMs: 4000,
  });

  const totalSpend = telemetry.totalSpendUsd;
  const projectedSpend = telemetry.projectedSpendUsd;
  const totalSavings = telemetry.cacheSavingsUsd;
  const totalRequests = telemetry.totalRequests;

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col lg:flex-row selection:bg-[#DFB277] selection:text-[#0E0E0E] font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#DFB277] tracking-wider uppercase mb-1 font-mono">
                  <Zap className="w-3 h-3 text-[#DFB277]" />
                  <span>AI OPERATIONS</span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-neutral-400">FINOPS & COSTS</span>
                </div>

                {/* Title with Badge */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Cost Center & Spend Attribution
                  </h1>
                  <div className="w-6 h-6 rounded-md border border-[#DFB277]/40 bg-[#DFB277]/10 flex items-center justify-center text-[#DFB277]">
                    <Coins className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Track real-time model costs, monthly projections, project allocations, and prompt cache savings.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Range Pills */}
                <div className="flex items-center bg-[#0E0E0E] border border-[#1A1A1A] p-1 rounded-xl text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 ml-2 mr-1.5" />
                  {(
                    [
                      { id: "mtd", label: "MTD" },
                      { id: "30d", label: "Last 30 Days" },
                      { id: "quarter", label: "This Quarter" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeRange(t.id)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === t.id
                          ? "bg-[#DFB277] text-[#0E0E0E] font-bold shadow-xs"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Budgets Navigation Link */}
                <Link
                  href="/dashboard/budgets"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:border-[#262626] transition-all cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#DFB277]" />
                  <span>Budgets</span>
                </Link>

                {/* Manage Billing CTA */}
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] text-xs font-bold font-mono transition-all cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Manage Billing</span>
                </Link>
              </div>
            </div>

            {/* 4 Top Stat / KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Current Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <BadgeDollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Incurred Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${totalSpend.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-[#10B981] font-mono">
                    Active billing cycle
                  </div>
                </div>
              </div>

              {/* Card 2: Estimated Month-End */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Projected Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${projectedSpend.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">
                    Velocity burn rate
                  </div>
                </div>
              </div>

              {/* Card 3: Cache Savings */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Cache Savings</span>
                  </div>
                  <div className="text-xl font-bold text-[#10B981] pt-0.5 font-mono">
                    ${totalSavings.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">
                    {telemetry.cacheHitRatePercent}% hit deflection
                  </div>
                </div>
              </div>

              {/* Card 4: Total Requests */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Proxied Requests</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {totalRequests.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">
                    Avg: {totalRequests > 0 ? `$${((totalSpend / totalRequests) * 1000).toFixed(3)}/1k reqs` : "$0.00/1k"}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown View Tabs (Model, Provider) */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161616]">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#DFB277]" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">Cost Attribution Breakdown</h3>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0A0A0A] border border-[#161616] text-xs font-mono">
                  {(
                    [
                      { id: "model", label: "By Model", icon: Cpu },
                      { id: "provider", label: "By Provider", icon: Layers },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                          activeTab === t.id
                            ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab 1: By Model */}
              {activeTab === "model" && (
                <div className="space-y-3">
                  {telemetry.modelDistribution.length === 0 ? (
                    <div className="p-12 text-center space-y-3 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                      <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-[#DFB277]">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-white">No model spend recorded yet</div>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        Incurred expenditure will appear dynamically once requests are proxied through the gateway.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#161616] text-[11px] text-neutral-500 uppercase">
                            <th className="py-2.5 px-3">Model</th>
                            <th className="py-2.5 px-3">Requests</th>
                            <th className="py-2.5 px-3">Tokens</th>
                            <th className="py-2.5 px-3 text-right">Incurred Spend</th>
                            <th className="py-2.5 px-3 text-right">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]">
                          {telemetry.modelDistribution.map((m) => (
                            <tr key={m.model} className="hover:bg-[#121212] transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <ModelProviderLogo provider={m.provider} modelId={m.model} size="sm" />
                                  <div>
                                    <span className="text-white font-bold">{m.model}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase block">{m.provider}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-neutral-300">{m.requests.toLocaleString()}</td>
                              <td className="py-3 px-3 text-neutral-300">{m.totalTokens.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-bold text-[#DFB277]">${m.spendUsd.toFixed(4)}</td>
                              <td className="py-3 px-3 text-right text-neutral-400">{m.percentageOfSpend.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: By Provider */}
              {activeTab === "provider" && (
                <div className="space-y-3">
                  {telemetry.providerDistribution.length === 0 ? (
                    <div className="p-12 text-center space-y-3 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                      <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-[#DFB277]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-white">No provider spend recorded yet</div>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        Provider spend will appear once gateway proxy requests are made.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#161616] text-[11px] text-neutral-500 uppercase">
                            <th className="py-2.5 px-3">Provider</th>
                            <th className="py-2.5 px-3">Requests</th>
                            <th className="py-2.5 px-3">Total Tokens</th>
                            <th className="py-2.5 px-3 text-right">Incurred Spend</th>
                            <th className="py-2.5 px-3 text-right">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]">
                          {telemetry.providerDistribution.map((p) => (
                            <tr key={p.provider} className="hover:bg-[#121212] transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <ModelProviderLogo provider={p.provider} size="sm" />
                                  <span className="text-white font-bold capitalize">{p.provider}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-neutral-300">{p.requests.toLocaleString()}</td>
                              <td className="py-3 px-3 text-neutral-300">{p.totalTokens.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-bold text-[#DFB277]">${p.spendUsd.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right text-neutral-400">{p.percentageOfSpend.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
