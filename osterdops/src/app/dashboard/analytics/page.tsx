"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { RequestsTable } from "@/components/analytics/RequestsTable";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import {
  Calendar,
  Timer,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  RotateCw,
  ArrowRight,
  Activity,
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [activeChartMetric, setActiveChartMetric] = useState<"spend" | "requests" | "tokens" | "latency">("spend");
  const [activeModelTab, setActiveModelTab] = useState<"all" | "openai" | "anthropic" | "gemini" | "kimi">("all");

  // Global Real-time Telemetry Pipeline
  const { data, isLoading, isValidating, refetch, lastUpdated } = useLiveTelemetry({
    timeRange,
    pollIntervalMs: 4000,
  });

  const filteredModels = data.modelDistribution.filter((m) => {
    if (activeModelTab === "all") return true;
    return m.provider.toLowerCase() === activeModelTab.toLowerCase();
  });

  const getMetricValue = (pt: (typeof data.timeSeries)[0]) => {
    if (activeChartMetric === "spend") return pt.spendUsd;
    if (activeChartMetric === "requests") return pt.requests;
    if (activeChartMetric === "tokens") return pt.tokens;
    return pt.averageLatencyMs;
  };

  const formatMetricValue = (val: number) => {
    if (activeChartMetric === "spend") return `$${val.toFixed(2)}`;
    if (activeChartMetric === "requests") return val.toLocaleString();
    if (activeChartMetric === "tokens") return val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val.toLocaleString();
    return `${Math.round(val)}ms`;
  };

  const chartMaxVal = data.timeSeries.length > 0 ? Math.max(...data.timeSeries.map(getMetricValue), 1) : 1;

  // Status code distribution
  const statusCodeEntries = Object.entries(data.byStatusCode || {});

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
                  <span className="text-neutral-400">ANALYTICS</span>
                </div>

                {/* Page Title with Observability Badge */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Analytics Center
                  </h1>
                  <div className="w-6 h-6 rounded-md border border-[#DFB277]/40 bg-[#DFB277]/10 flex items-center justify-center text-[#DFB277]">
                    <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Cross-provider spend, request volume, token throughput, and real-time latency percentiles.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Range Selector */}
                <div className="flex items-center bg-[#0E0E0E] border border-[#1A1A1A] p-1 rounded-xl text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 ml-2 mr-1.5" />
                  {(["24h", "7d", "30d", "90d"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === range
                          ? "bg-[#DFB277] text-[#0E0E0E] font-bold shadow-xs"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* Refresh Action */}
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] text-xs font-mono text-neutral-300 transition-all cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-[#DFB277] ${isValidating ? "animate-spin" : ""}`} />
                  <span>{isValidating ? "Syncing..." : "Live"}</span>
                </button>
              </div>
            </div>

            {/* 5 Top KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase">
                  <span>Total Spend</span>
                  <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#DFB277]">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-white font-mono mt-2">
                  ${data.totalSpendUsd.toFixed(2)}
                </div>
                <div className="text-[10.5px] text-neutral-500 font-mono mt-1">
                  Incurred ({timeRange})
                </div>
              </div>

              {/* Card 2: Total Requests */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase">
                  <span>Total Requests</span>
                  <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#DFB277]">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-white font-mono mt-2">
                  {data.totalRequests.toLocaleString()}
                </div>
                <div className="text-[10.5px] text-neutral-500 font-mono mt-1">
                  {data.errorRatePercent > 0 ? `${data.errorRatePercent}% error rate` : "100% success rate"}
                </div>
              </div>

              {/* Card 3: Total Metered Tokens */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase">
                  <span>Total Tokens</span>
                  <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#DFB277]">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-white font-mono mt-2">
                  {data.totalTokens >= 1_000_000
                    ? `${(data.totalTokens / 1_000_000).toFixed(2)}M`
                    : data.totalTokens.toLocaleString()}
                </div>
                <div className="text-[10.5px] text-neutral-500 font-mono mt-1">
                  Prompt: {data.promptTokens.toLocaleString()}
                </div>
              </div>

              {/* Card 4: Average / p95 Latency */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase">
                  <span>Latency (Avg / p95)</span>
                  <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#DFB277]">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-white font-mono mt-2">
                  {data.averageLatencyMs}ms <span className="text-xs text-neutral-500">/ {data.p95LatencyMs}ms</span>
                </div>
                <div className="text-[10.5px] text-neutral-500 font-mono mt-1">
                  p99: {data.p99LatencyMs}ms
                </div>
              </div>

              {/* Card 5: Cache Deflection Savings */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase">
                  <span>Cache Deflection</span>
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-[#10B981] font-mono mt-2">
                  ${data.cacheSavingsUsd.toFixed(2)}
                </div>
                <div className="text-[10.5px] text-neutral-500 font-mono mt-1">
                  {data.cacheHitRatePercent}% hit efficiency
                </div>
              </div>
            </div>

            {/* Velocity Curve SVG Chart & Latency Percentiles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Velocity Curve Chart (8 Cols) */}
              <div className="lg:col-span-8 rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161616]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#DFB277]/10 text-[#DFB277] flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono">Telemetry Velocity Curve</h3>
                  </div>

                  {/* Toggle Metric Pills */}
                  <div className="flex items-center gap-1 text-[11px] p-0.5 rounded-lg bg-[#0A0A0A] border border-[#161616] font-mono">
                    {(["spend", "requests", "tokens", "latency"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setActiveChartMetric(m)}
                        className={`px-2.5 py-0.5 rounded-md capitalize transition-colors cursor-pointer ${
                          activeChartMetric === m
                            ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="h-44 w-full relative">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                      <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mr-2" />
                      <span>Syncing telemetry...</span>
                    </div>
                  ) : data.timeSeries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-1 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                      <div className="text-xs font-semibold text-white">No telemetry data for this period</div>
                      <p className="text-[11px] text-neutral-500 max-w-sm">
                        As requests and token events are routed through the proxy gateway, real-time velocity curves will render here.
                      </p>
                    </div>
                  ) : (
                    <svg viewBox="0 0 500 170" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradientFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DFB277" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#DFB277" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      {[20, 55, 90, 125, 155].map((y, i) => (
                        <line key={i} x1="45" y1={y} x2="495" y2={y} stroke="#161616" strokeWidth="1" />
                      ))}

                      {/* Dynamic Points & Curves */}
                      {(() => {
                        const coords = data.timeSeries.map((pt, idx) => {
                          const x = 55 + (idx / Math.max(1, data.timeSeries.length - 1)) * 435;
                          const val = getMetricValue(pt);
                          const y = 155 - (val / chartMaxVal) * 125;
                          return { x, y, label: formatMetricValue(val), date: pt.date };
                        });

                        const pathD = coords.reduce(
                          (acc, c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`),
                          ""
                        );
                        const areaD = `${pathD} L ${coords[coords.length - 1].x} 155 L ${coords[0].x} 155 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#chartGradientFill)" />
                            <path d={pathD} fill="none" stroke="#DFB277" strokeWidth="2.2" strokeLinecap="round" />
                            {coords.map((p, idx) => (
                              <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#0E0E0E" stroke="#DFB277" strokeWidth="2" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>
              </div>

              {/* Right Column: Latency Percentiles & Status Codes (4 Cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#DFB277]/10 text-[#DFB277] flex items-center justify-center">
                      <Timer className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono">Latency Percentiles</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-[#10B981] px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 font-mono">
                    {data.totalRequests > 0 ? "Live Samples" : "Standby"}
                  </span>
                </div>

                {/* Percentile Badges Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "P50", val: `${data.p50LatencyMs}ms`, color: "text-[#10B981]" },
                    { label: "P90", val: `${data.p90LatencyMs}ms`, color: "text-[#DFB277]" },
                    { label: "P95", val: `${data.p95LatencyMs}ms`, color: "text-[#DFB277]" },
                    { label: "P99", val: `${data.p99LatencyMs}ms`, color: "text-orange-400" },
                    { label: "AVG", val: `${data.averageLatencyMs}ms`, color: "text-neutral-200" },
                    { label: "SUCCESS", val: `${data.successRatePercent}%`, color: "text-[#10B981]" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="p-2 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-all"
                    >
                      <div className="text-[9.5px] font-bold text-neutral-500 uppercase font-mono">{p.label}</div>
                      <div className={`text-xs font-bold font-mono mt-0.5 ${p.color}`}>{p.val}</div>
                    </div>
                  ))}
                </div>

                {/* Status Code Distribution */}
                <div className="pt-2 border-t border-[#161616] space-y-2">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">HTTP Status Code Distribution</div>
                  {statusCodeEntries.length === 0 ? (
                    <div className="text-xs font-mono text-neutral-500">No HTTP responses logged</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {statusCodeEntries.map(([code, count]) => {
                        const is2xx = code.startsWith("2");
                        const is429 = code === "429";
                        return (
                          <div
                            key={code}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                              is2xx
                                ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                                : is429
                                ? "bg-[#DFB277]/10 text-[#DFB277] border-[#DFB277]/30"
                                : "bg-red-950/40 text-red-400 border-red-800/30"
                            }`}
                          >
                            <span>HTTP {code}</span>
                            <span className="font-bold">({count})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Multi-Dimensional Analysis: Providers + Model Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Provider Allocation (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#DFB277]/10 text-[#DFB277] flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono">Provider Allocation</h3>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">{data.providerDistribution.length} Active</span>
                </div>

                <div className="space-y-3">
                  {data.providerDistribution.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                      No provider usage recorded yet
                    </div>
                  ) : (
                    data.providerDistribution.map((p) => (
                      <div
                        key={p.provider}
                        className="p-3 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ModelProviderLogo provider={p.provider} size="sm" />
                            <div>
                              <div className="font-bold text-xs text-white capitalize">{p.provider}</div>
                              <div className="text-[10.5px] text-neutral-500 font-mono">{p.requests.toLocaleString()} requests</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#DFB277] font-mono">${p.spendUsd.toFixed(2)}</div>
                            <div className="text-[10.5px] text-neutral-500 font-mono">{p.percentageOfSpend.toFixed(1)}% of total</div>
                          </div>
                        </div>

                        <div className="w-full bg-[#161616] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#DFB277]"
                            style={{ width: `${Math.min(100, Math.max(5, p.percentageOfSpend))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Model Efficiency & Cost Breakdown Table (7 Cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#161616]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#DFB277]/10 text-[#DFB277] flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono">Model Efficiency Matrix</h3>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 text-[11px] p-0.5 rounded-lg bg-[#0A0A0A] border border-[#161616] font-mono">
                    {(["all", "openai", "anthropic", "gemini", "kimi"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setActiveModelTab(prov)}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer capitalize ${
                          activeModelTab === prov
                            ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Rows */}
                <div className="overflow-x-auto">
                  {filteredModels.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                      No model activity recorded for this period
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#161616] text-[10.5px] uppercase tracking-wider text-neutral-500 font-semibold">
                          <th className="py-2.5 px-3">Model</th>
                          <th className="py-2.5 px-3">Requests</th>
                          <th className="py-2.5 px-3">Total Tokens</th>
                          <th className="py-2.5 px-3">Avg Latency</th>
                          <th className="py-2.5 px-3 text-right">Incurred Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]">
                        {filteredModels.map((m) => (
                          <tr key={m.model} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <ModelProviderLogo provider={m.provider} modelId={m.model} size="sm" />
                                <div>
                                  <div className="font-mono text-white font-bold text-[11.5px]">{m.model}</div>
                                  <div className="text-[10px] text-neutral-500 uppercase">{m.provider}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {m.requests.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {m.totalTokens.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-mono text-white">{Math.round(m.requests > 0 ? (data.averageLatencyMs || 0) : 0)}ms</span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#DFB277]">
                              ${m.spendUsd.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Live Request Stream Table */}
            <RequestsTable requests={data.recentRequests} isLoading={isLoading} maxRows={25} />

            {/* Bottom Observability Insight Banner */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/25 flex items-center justify-center text-[#DFB277] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Observability & Cache Governance</div>
                  <div className="text-[11.5px] text-neutral-400">
                    Semantic cache deflection saved{" "}
                    <span className="text-[#10B981] font-semibold font-mono">${data.cacheSavingsUsd.toFixed(2)}</span> across live gateway requests with an average round-trip latency of{" "}
                    <span className="text-[#DFB277] font-semibold font-mono">{data.averageLatencyMs}ms</span>.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/models"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFB277] hover:text-[#E5C38E] transition-colors shrink-0 font-mono"
              >
                <span>Gateway Model Presets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
