"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  costPerMillionTokens: number;
}

const MODELS: ModelPricing[] = [
  { id: "gpt-4o", name: "OpenAI GPT-4o", provider: "OpenAI", costPerMillionTokens: 7.5 },
  { id: "claude-3-5-sonnet", name: "Anthropic Claude 3.5 Sonnet", provider: "Anthropic", costPerMillionTokens: 9.0 },
  { id: "gemini-2-flash", name: "Google Gemini 2.0 Flash", provider: "Google", costPerMillionTokens: 0.35 },
  { id: "deepseek-chat", name: "DeepSeek-V3 / Chat", provider: "DeepSeek", costPerMillionTokens: 0.55 },
];

export function InteractiveRoiCalculator() {
  const [requestsPerMonth, setRequestsPerMonth] = useState<number>(1500000);
  const [avgTokensPerRequest, setAvgTokensPerRequest] = useState<number>(1800);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  const model = useMemo(
    () => MODELS.find((m) => m.id === selectedModel) || MODELS[0],
    [selectedModel]
  );

  const {
    totalTokensMillion,
    unoptimizedCost,
    cacheSavings,
    downgradeSavings,
    netCost,
    netSavingsMonthly,
    annualSavings,
    savingsPercentage,
  } = useMemo(() => {
    const tokens = (requestsPerMonth * avgTokensPerRequest) / 1000000;
    const baseCost = tokens * model.costPerMillionTokens;

    // OsterdOps Semantic Caching reduces 36% of repeated calls to ~0 cost
    const cache = baseCost * 0.36;

    // Smart Downgrades reduce 20% of background or simple requests
    const downgrade = baseCost * 0.20;

    const totalSavings = cache + downgrade;
    const finalNet = Math.max(0, baseCost - totalSavings);
    const annual = totalSavings * 12;
    const percentage = baseCost > 0 ? (totalSavings / baseCost) * 100 : 0;

    return {
      totalTokensMillion: tokens,
      unoptimizedCost: Math.round(baseCost),
      cacheSavings: Math.round(cache),
      downgradeSavings: Math.round(downgrade),
      netCost: Math.round(finalNet),
      netSavingsMonthly: Math.round(totalSavings),
      annualSavings: Math.round(annual),
      savingsPercentage: Math.round(percentage),
    };
  }, [requestsPerMonth, avgTokensPerRequest, model]);

  return (
    <section className="py-20 sm:py-28 bg-[#080808] relative overflow-hidden border-t border-[#161720]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(223,178,119,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(223,178,119,0.15)]">
            <Coins className="w-3.5 h-3.5 text-[#DFB277]" />
            <span>Interactive FinOps ROI Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Calculate Your Immediate <span className="text-[#DFB277]">AI Cost Reductions</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Estimate how much your engineering team saves every month with OsterdOps in-memory semantic caching, automated model tiering, and pre-flight runaway circuit breakers.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-7 bg-[#0D0E14] border border-[#1F222E] rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl">
            {/* 1. Model Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Baseline Frontier Model</span>
                <span className="text-[#DFB277] text-[11px]">${model.costPerMillionTokens}/M tokens</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-medium text-left transition-all border cursor-pointer ${
                      selectedModel === m.id
                        ? "bg-[#DFB277]/15 border-[#DFB277] text-white shadow-[0_0_12px_rgba(223,178,119,0.2)]"
                        : "bg-[#12131A] border-[#1E202C] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    }`}
                  >
                    <div className="font-semibold truncate">{m.name.split(" ")[1] || m.name}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{m.provider}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Monthly Requests Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider">
                  Monthly Inference Requests
                </span>
                <span className="text-[#DFB277] font-bold text-sm">
                  {requestsPerMonth >= 1000000
                    ? `${(requestsPerMonth / 1000000).toFixed(1)}M reqs/mo`
                    : `${(requestsPerMonth / 1000).toFixed(0)}k reqs/mo`}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={100000}
                value={requestsPerMonth}
                onChange={(e) => setRequestsPerMonth(Number(e.target.value))}
                className="w-full accent-[#DFB277] bg-[#1A1C28] h-2 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>100K</span>
                <span>2.5M</span>
                <span>5M</span>
                <span>10M+</span>
              </div>
            </div>

            {/* 3. Average Tokens per Request Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider">
                  Avg Tokens per Request (Prompt + Completion)
                </span>
                <span className="text-[#DFB277] font-bold text-sm">
                  {avgTokensPerRequest.toLocaleString()} tokens
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={6000}
                step={100}
                value={avgTokensPerRequest}
                onChange={(e) => setAvgTokensPerRequest(Number(e.target.value))}
                className="w-full accent-[#DFB277] bg-[#1A1C28] h-2 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>400 (Chat/Micro)</span>
                <span>1,800 (Typical RAG)</span>
                <span>3,500 (Agents)</span>
                <span>6,000 (Long Context)</span>
              </div>
            </div>

            {/* Volume Stats Pill */}
            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#171822] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-400">
                <Layers className="w-4 h-4 text-[#DFB277]" />
                <span>Estimated Ingestion Volume:</span>
              </div>
              <span className="text-white font-bold">{totalTokensMillion.toFixed(1)}B Tokens/Month</span>
            </div>
          </div>

          {/* Results Column (Right) */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-[#14151E] via-[#0E0F16] to-[#0A0B10] border-2 border-[#DFB277]/40 p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(223,178,119,0.15)] relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                  Estimated FinOps Impact
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  -{savingsPercentage}% SPEND
                </span>
              </div>

              {/* Big Savings Number */}
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 font-sans">Projected Annual Savings</div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight text-[#DFB277]">
                  ${annualSavings.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>${netSavingsMonthly.toLocaleString()}/month direct margin reclaimed</span>
                </div>
              </div>

              {/* Breakdown Stack */}
              <div className="space-y-3 pt-2 border-t border-[#1C1E2B] text-xs font-mono">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Raw Provider Bill (Without OsterdOps):</span>
                  <span className="text-neutral-300 font-semibold line-through decoration-rose-500">
                    ${unoptimizedCost.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>In-Memory Semantic Caching (36%):</span>
                  </span>
                  <span>-${cacheSavings.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Smart Model Auto-Downgrade (20%):</span>
                  </span>
                  <span>-${downgradeSavings.toLocaleString()}/mo</span>
                </div>
                <div className="pt-2 border-t border-[#1F2232] flex justify-between items-center text-sm font-bold text-white">
                  <span>Net Spend With OsterdOps:</span>
                  <span className="text-emerald-400 font-mono text-base">
                    ${netCost.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 mt-6 border-t border-[#1C1E2B] space-y-3">
              <Link
                href="/sign-up"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-mono font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(223,178,119,0.3)] hover:shadow-[0_0_30px_rgba(223,178,119,0.5)] cursor-pointer"
              >
                <span>Deploy AI Perimeter &amp; Reclaim Savings</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <div className="text-center text-[10.5px] font-mono text-neutral-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero code rewrite • 1-line baseURL proxy drop-in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
