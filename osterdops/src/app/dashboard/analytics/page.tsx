"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Calendar,
  Timer,
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  RotateCw,
  Download,
  Info,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Coins,
  Activity,
  Database,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface TimeSeriesPoint {
  date: string;
  spendUsd: number;
  requests: number;
  tokens: number;
  averageLatencyMs: number;
}

interface ProviderData {
  provider: string;
  requests: number;
  spendUsd: number;
  percentageOfSpend: number;
  tokens: number;
  averageLatencyMs: number;
}

interface ModelData {
  model: string;
  provider: string;
  requests: number;
  spendUsd: number;
  tokens: number;
  averageLatencyMs: number;
}

interface AnalyticsState {
  totalSpendUsd: number;
  totalRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  cacheSavingsUsd: number;
  cacheHitRatePercent: number;
  averageLatencyMs: number;
  errorRatePercent: number;
  successRatePercent: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  providerDistribution: ProviderData[];
  modelDistribution: ModelData[];
  statusCodeDistribution: Array<{ code: number; count: number; label: string }>;
  timeSeries: TimeSeriesPoint[];
}

const EMPTY_ANALYTICS: AnalyticsState = {
  totalSpendUsd: 0,
  totalRequests: 0,
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  cachedTokens: 0,
  cacheSavingsUsd: 0,
  cacheHitRatePercent: 0,
  averageLatencyMs: 0,
  errorRatePercent: 0,
  successRatePercent: 100,
  p50LatencyMs: 0,
  p90LatencyMs: 0,
  p95LatencyMs: 0,
  p99LatencyMs: 0,
  minLatencyMs: 0,
  maxLatencyMs: 0,
  providerDistribution: [],
  modelDistribution: [],
  statusCodeDistribution: [],
  timeSeries: [],
};

export default function AnalyticsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsState>(EMPTY_ANALYTICS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChartMetric, setActiveChartMetric] = useState<"spend" | "requests" | "tokens" | "latency">("spend");
  const [activeModelTab, setActiveModelTab] = useState<"all" | "openai" | "anthropic" | "gemini">("all");

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange },
          token,
        });

        if (!isMounted) return;

        if (res.data && res.data.kpis) {
          const kpis = res.data.kpis;
          const p = Array.isArray(res.data.byProvider) ? res.data.byProvider : [];
          const m = Array.isArray(res.data.byModel) ? res.data.byModel : [];
          const ts = Array.isArray(res.data.timeSeries)
            ? res.data.timeSeries.map((pt: any) => ({
                date: pt.date ? new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
                spendUsd: pt.spendUsd ?? 0,
                requests: pt.requests ?? 0,
                tokens: pt.tokens ?? 0,
                averageLatencyMs: pt.averageLatencyMs ?? 0,
              }))
            : [];

          setData({
            totalSpendUsd: kpis.totalSpendUsd ?? 0,
            totalRequests: kpis.totalRequests ?? 0,
            totalTokens: kpis.totalTokens ?? 0,
            promptTokens: kpis.totalInputTokens ?? 0,
            completionTokens: kpis.totalOutputTokens ?? 0,
            cachedTokens: kpis.totalCachedTokens ?? 0,
            cacheSavingsUsd: kpis.totalCacheSavingsUsd ?? 0,
            cacheHitRatePercent: kpis.cacheHitRatePercent ?? 0,
            averageLatencyMs: kpis.averageLatencyMs ?? 0,
            errorRatePercent: kpis.errorRatePercent ?? 0,
            successRatePercent: kpis.successRatePercent ?? 100,
            p50LatencyMs: kpis.latencyPercentiles?.p50Ms ?? 0,
            p90LatencyMs: kpis.latencyPercentiles?.p90Ms ?? 0,
            p95LatencyMs: kpis.latencyPercentiles?.p95Ms ?? 0,
            p99LatencyMs: kpis.latencyPercentiles?.p99Ms ?? 0,
            minLatencyMs: kpis.latencyPercentiles?.minMs ?? 0,
            maxLatencyMs: kpis.latencyPercentiles?.maxMs ?? 0,
            providerDistribution: p,
            modelDistribution: m,
            statusCodeDistribution: Array.isArray(res.data.byStatusCode) ? res.data.byStatusCode : [],
            timeSeries: ts,
          });
        } else {
          setData(EMPTY_ANALYTICS);
        }
      } catch (e) {
        if (isMounted) setData(EMPTY_ANALYTICS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken, timeRange, refreshKey]);

  const filteredModels = data.modelDistribution.filter((m) => {
    if (activeModelTab === "all") return true;
    return m.provider.toLowerCase() === activeModelTab.toLowerCase();
  });

  const getMetricValue = (pt: TimeSeriesPoint) => {
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

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>AI OPERATIONS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">ANALYTICS</span>
                </div>

                {/* Page Title with Observability Badge */}
                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Analytics Center
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Cross-provider spend, request volume, token throughput, and real-time latency percentiles.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Range Selector */}
                <div className="flex items-center bg-[#0c0e16] border border-[#1b1e2c] p-1 rounded-xl text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#73788c] ml-2 mr-1.5" />
                  {(["24h", "7d", "30d", "90d"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === range
                          ? "bg-[#dfba82] text-black shadow-[0_0_12px_rgba(223,186,130,0.3)]"
                          : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Refresh analytics data"
                  className={`p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer ${
                    loading ? "animate-spin text-[#dfba82]" : ""
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Export Report Button */}
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `osterdops-analytics-${timeRange}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs font-semibold text-[#c5c9d6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#8e93a6]" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-[#6b7082]" />
                </button>
              </div>
            </div>

            {/* 5 Top Metric Stat Cards in a Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Total Spend
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${data.totalSpendUsd.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+${data.cacheSavingsUsd.toFixed(2)} cache savings</span>
                  </div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Total Requests */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Total Requests</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {data.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">
                    {data.successRatePercent}% success rate
                  </div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Token Throughput */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Total Tokens</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {data.totalTokens >= 1_000_000
                      ? `${(data.totalTokens / 1_000_000).toFixed(2)}M`
                      : data.totalTokens.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-purple-400 font-medium">
                    Prompt {(data.promptTokens / 1000).toFixed(0)}k / Comp {(data.completionTokens / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: P95 Latency */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">P95 Latency</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {data.p95LatencyMs}ms
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">
                    p50: {data.p50LatencyMs}ms | avg: {Math.round(data.averageLatencyMs)}ms
                  </div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Cache Hit Rate */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Cache Efficiency</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {data.cacheHitRatePercent}%
                  </div>
                  <div className="text-[10.5px] text-blue-400 font-medium">
                    {data.cachedTokens.toLocaleString()} cached tokens
                  </div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle Grid: Main Time-Series Spline Chart + Latency Percentiles Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: Interactive Metric Trendline Chart (8 Cols) */}
              <div className="lg:col-span-8 rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-3.5 shadow-xl">
                {/* Chart Header & Metric Selectors */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161824]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#dfba82]/15 text-[#dfba82] flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Observability & Telemetry Velocity</h3>
                  </div>

                  {/* Metric Switcher Tabs */}
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#141624] border border-[#23273a] text-xs">
                    {(
                      [
                        { id: "spend", label: "Spend ($)" },
                        { id: "requests", label: "Requests" },
                        { id: "tokens", label: "Tokens" },
                        { id: "latency", label: "Latency (ms)" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveChartMetric(m.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                          activeChartMetric === m.id
                            ? "bg-[#dfba82] text-black font-bold shadow-[0_0_10px_rgba(223,186,130,0.25)]"
                            : "text-[#8e93a6] hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Spline Area Chart or Empty State */}
                <div className="h-56 w-full relative pt-2">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-xs text-[#8e93a6] space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#dfba82]" />
                      <span>Loading telemetry timeline...</span>
                    </div>
                  ) : data.timeSeries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 border border-[#171a27] rounded-xl bg-[#090b12]">
                      <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-white">No telemetry data for this period</div>
                      <p className="text-[11px] text-[#73788c] max-w-sm">
                        As requests and token events are routed through the proxy gateway, real-time velocity curves will render here.
                      </p>
                    </div>
                  ) : (
                    <svg viewBox="0 0 500 170" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradientFill" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={
                              activeChartMetric === "spend"
                                ? "#dfba82"
                                : activeChartMetric === "requests"
                                ? "#10b981"
                                : activeChartMetric === "tokens"
                                ? "#a855f7"
                                : "#f97316"
                            }
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              activeChartMetric === "spend"
                                ? "#dfba82"
                                : activeChartMetric === "requests"
                                ? "#10b981"
                                : activeChartMetric === "tokens"
                                ? "#a855f7"
                                : "#f97316"
                            }
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      {[20, 55, 90, 125, 155].map((y, i) => (
                        <line key={i} x1="45" y1={y} x2="495" y2={y} stroke="#161824" strokeWidth="1" />
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
                        const strokeColor =
                          activeChartMetric === "spend"
                            ? "#dfba82"
                            : activeChartMetric === "requests"
                            ? "#10b981"
                            : activeChartMetric === "tokens"
                            ? "#a855f7"
                            : "#f97316";

                        return (
                          <>
                            <path d={areaD} fill="url(#chartGradientFill)" />
                            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
                            {coords.map((p, idx) => (
                              <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#0c0e16" stroke={strokeColor} strokeWidth="2" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {/* X-axis Labels */}
                  {data.timeSeries.length > 0 && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#555a6d] pt-1 pl-12 pr-2">
                      {data.timeSeries.map((t, i) => (
                        <span key={i}>{t.date}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Latency Percentiles Deep-Dive (4 Cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#161824]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-orange-950/40 text-orange-400 flex items-center justify-center">
                      <Timer className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Latency Distribution</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30">
                    {data.totalRequests > 0 ? "Live Samples" : "Standby"}
                  </span>
                </div>

                {/* Percentile Badges Grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  {[
                    { label: "MIN", val: `${data.minLatencyMs}ms`, color: "text-emerald-400" },
                    { label: "P50", val: `${data.p50LatencyMs}ms`, color: "text-emerald-400" },
                    { label: "P90", val: `${data.p90LatencyMs}ms`, color: "text-amber-400" },
                    { label: "P95", val: `${data.p95LatencyMs}ms`, color: "text-[#dfba82]" },
                    { label: "P99", val: `${data.p99LatencyMs}ms`, color: "text-orange-400" },
                    { label: "MAX", val: `${data.maxLatencyMs}ms`, color: "text-red-400" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="p-2 rounded-xl bg-[#08090f] border border-[#161824] hover:border-[#2a2f45] transition-all"
                    >
                      <div className="text-[9.5px] font-bold text-[#6b7082] uppercase">{p.label}</div>
                      <div className={`text-xs font-bold font-mono mt-0.5 ${p.color}`}>{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Multi-Dimensional Analysis: Providers + Model Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Provider Distribution (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#161824]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#dfba82]/15 text-[#dfba82] flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Provider Allocation</h3>
                  </div>
                  <span className="text-[11px] text-[#6b7082]">{data.providerDistribution.length} Active Providers</span>
                </div>

                <div className="space-y-3">
                  {data.providerDistribution.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824]">
                      No provider usage recorded yet
                    </div>
                  ) : (
                    data.providerDistribution.map((p) => (
                      <div
                        key={p.provider}
                        className="p-3 rounded-xl bg-[#08090f] border border-[#161824] hover:border-[#2a2f45] transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-white capitalize">{p.provider}</div>
                            <div className="text-[10.5px] text-[#6b7082]">{p.requests.toLocaleString()} requests</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#dfba82] font-mono">${p.spendUsd.toFixed(2)}</div>
                            <div className="text-[10.5px] text-[#6b7082]">{p.percentageOfSpend.toFixed(1)}% of total</div>
                          </div>
                        </div>

                        <div className="w-full bg-[#161824] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#dfba82]"
                            style={{ width: `${Math.min(100, Math.max(5, p.percentageOfSpend))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Model Efficiency & Cost Breakdown Table (7 Cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#161824]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#dfba82]/15 text-[#dfba82] flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Model Efficiency Matrix</h3>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 text-[11px] p-0.5 rounded-lg bg-[#141624] border border-[#23273a]">
                    {(["all", "OpenAI", "Anthropic", "Gemini"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setActiveModelTab(prov.toLowerCase() as any)}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer capitalize ${
                          activeModelTab === prov.toLowerCase()
                            ? "bg-[#dfba82] text-black font-bold"
                            : "text-[#8e93a6] hover:text-white"
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
                    <div className="p-6 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824]">
                      No model activity recorded for this period
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#161824] text-[10.5px] uppercase tracking-wider text-[#555a6d] font-semibold">
                          <th className="py-2.5 px-3">Model</th>
                          <th className="py-2.5 px-3">Requests</th>
                          <th className="py-2.5 px-3">Total Tokens</th>
                          <th className="py-2.5 px-3">Avg Latency</th>
                          <th className="py-2.5 px-3 text-right">Incurred Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141724]">
                        {filteredModels.map((m) => (
                          <tr key={m.model} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-mono text-white font-bold text-[11.5px]">{m.model}</div>
                              <div className="text-[10px] text-[#6b7082] uppercase">{m.provider}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[#c5c9d6]">
                              {m.requests.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-[#c5c9d6]">
                              {m.tokens.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-mono text-white">{Math.round(m.averageLatencyMs)}ms</span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#dfba82]">
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

            {/* Bottom Observability Insight Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Observability Telemetry</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Semantic caching deflected{" "}
                    <span className="text-emerald-400 font-semibold">{data.cachedTokens.toLocaleString()} tokens</span>, saving{" "}
                    <span className="text-[#dfba82] font-semibold">${data.cacheSavingsUsd.toFixed(2)}</span> in upstream LLM inference.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/requests"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Inspect Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
