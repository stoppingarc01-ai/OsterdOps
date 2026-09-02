"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import {
  Layers,
  Cpu,
  Calendar,
  Zap,
  CreditCard,
  Loader2,
  Terminal,
  ArrowRight,
} from "lucide-react";

export default function BillingUsagePage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "openai" | "anthropic" | "gemini" | "kimi" | "meta">("all");

  const { data: telemetry, isLoading, isValidating } = useLiveTelemetry({
    timeRange: "30d",
    pollIntervalMs: 4000,
  });

  const filteredModels = telemetry.modelDistribution.filter((m) => {
    if (activeFilter === "all") return true;
    return m.provider.toLowerCase() === activeFilter.toLowerCase();
  });

  const totalPromptTokens = telemetry.promptTokens;
  const totalCompletionTokens = telemetry.completionTokens;
  const totalMeteredTokens = telemetry.totalTokens;
  const totalSpend = telemetry.totalSpendUsd;

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
                  <span className="text-neutral-400">USAGE METERING</span>
                </div>

                {/* Title */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Metered Token Usage & Entitlements
                  </h1>
                  <div className="w-6 h-6 rounded-md border border-[#DFB277]/40 bg-[#DFB277]/10 flex items-center justify-center text-[#DFB277]">
                    <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  High-fidelity token metering across prompt, completion, cache hits, and quota consumption.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] text-xs font-mono text-neutral-300">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Active 30-Day Window</span>
                </div>

                <Link
                  href="/dashboard/budgets"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] text-xs font-bold font-mono transition-all cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Manage Budgets</span>
                </Link>
              </div>
            </div>

            {/* 4 Top KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Total Metered Tokens */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">Total Tokens</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {totalMeteredTokens.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">Aggregated Throughput</div>
                </div>
              </div>

              {/* Card 2: Prompt Tokens */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">Prompt Tokens</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {totalPromptTokens.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">Inbound Context Volume</div>
                </div>
              </div>

              {/* Card 3: Completion Tokens */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">Completion Tokens</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {totalCompletionTokens.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">Generated Output Volume</div>
                </div>
              </div>

              {/* Card 4: Incurred Token Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">Metered Spend</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#10B981]">
                    ${totalSpend.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">Calculated at 1M Rates</div>
                </div>
              </div>
            </div>

            {/* Main Token Meters Table */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161616]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#DFB277]" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">Model Token Consumption Breakdown</h3>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0A0A0A] border border-[#161616] text-xs font-mono">
                  {(["all", "openai", "anthropic", "gemini", "kimi"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setActiveFilter(prov)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                        activeFilter === prov
                          ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {filteredModels.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-[#DFB277]">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-white">No token consumption recorded yet</div>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Token meters populate dynamically with exact input and output counts once requests are proxied.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard/models"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DFB277] text-[#0E0E0E] text-xs font-semibold hover:bg-[#E5C38E] transition-all"
                    >
                      <span>Connect Provider Key</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredModels.map((m) => {
                    const pctOfTokens = totalMeteredTokens > 0
                      ? Math.round((m.totalTokens / totalMeteredTokens) * 100)
                      : 0;

                    return (
                      <div
                        key={m.model}
                        className="p-4 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <ModelProviderLogo provider={m.provider} modelId={m.model} size="md" />
                            <div>
                              <div className="font-mono font-bold text-white text-sm">{m.model}</div>
                              <div className="text-xs text-neutral-500 uppercase font-mono">{m.provider} · {m.requests.toLocaleString()} calls</div>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-white">{m.totalTokens.toLocaleString()} tokens</div>
                            <div className="text-xs text-[#DFB277] font-semibold">${m.spendUsd.toFixed(4)}</div>
                          </div>
                        </div>

                        {/* Split Bar: Prompt vs Completion */}
                        <div className="space-y-1">
                          <div className="w-full bg-[#161616] h-2 rounded-full overflow-hidden flex">
                            <div
                              className="bg-[#DFB277] h-full"
                              style={{ width: `${m.totalTokens > 0 ? (m.inputTokens / m.totalTokens) * 100 : 50}%` }}
                              title={`Prompt tokens: ${m.inputTokens.toLocaleString()}`}
                            />
                            <div
                              className="bg-[#10B981] h-full"
                              style={{ width: `${m.totalTokens > 0 ? (m.outputTokens / m.totalTokens) * 100 : 50}%` }}
                              title={`Completion tokens: ${m.outputTokens.toLocaleString()}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#DFB277]" />
                              <span>Prompt: {m.inputTokens.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                              <span>Completion: {m.outputTokens.toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
