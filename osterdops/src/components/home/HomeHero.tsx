"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Lock,
  Activity,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Pause,
  Clock,
  Coins,
  Cpu,
  Eye,
  X,
  Server,
  Terminal,
} from "lucide-react";
import { OpenAILogo, GoogleGeminiLogo, AnthropicLogo, KimiLogo, MetaLlamaLogo } from "@/components/ui/ModelLogos";

interface LiveProxyLog {
  id: string;
  timestamp: string;
  model: string;
  provider: "openai" | "anthropic" | "gemini" | "kimi" | "meta";
  downgradedTo: string | null;
  savedAmount: string | null;
  savedPct: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  proxyOverheadMs: number;
  costUsd: number;
  status: 200 | 429;
  governanceAction: "passthrough" | "auto-downgraded" | "firewall_blocked";
  promptPreview: string;
}

export function HomeHero() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "metrics" | "guardrails">("pipeline");
  const [isStreaming, setIsStreaming] = useState(true);
  const [hoveredLog, setHoveredLog] = useState<LiveProxyLog | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>("all");

  const [logs, setLogs] = useState<LiveProxyLog[]>([
    {
      id: "gw_9f21b7",
      timestamp: "Just now",
      model: "gpt-4o",
      provider: "openai",
      downgradedTo: "gpt-4o-mini",
      savedAmount: "$0.00388",
      savedPct: "-94.2%",
      inputTokens: 142,
      outputTokens: 88,
      totalTokens: 230,
      latencyMs: 44,
      proxyOverheadMs: 1.8,
      costUsd: 0.00007,
      status: 200,
      governanceAction: "auto-downgraded",
      promptPreview: "Generate vector index configuration for enterprise audit logs...",
    },
    {
      id: "gw_8e10c4",
      timestamp: "2s ago",
      model: "claude-3-5-haiku-20241022",
      provider: "anthropic",
      downgradedTo: null,
      savedAmount: null,
      savedPct: null,
      inputTokens: 210,
      outputTokens: 120,
      totalTokens: 330,
      latencyMs: 62,
      proxyOverheadMs: 1.6,
      costUsd: 0.00065,
      status: 200,
      governanceAction: "passthrough",
      promptPreview: "Analyze real-time event pipeline latency percentiles (p95/p99)...",
    },
    {
      id: "gw_7a3bf2",
      timestamp: "5s ago",
      model: "kimi-k1.5",
      provider: "kimi",
      downgradedTo: null,
      savedAmount: null,
      savedPct: null,
      inputTokens: 380,
      outputTokens: 154,
      totalTokens: 534,
      latencyMs: 88,
      proxyOverheadMs: 2.1,
      costUsd: 0.00076,
      status: 200,
      governanceAction: "passthrough",
      promptPreview: "Synthesize quantitative quarterly token budget ceilings...",
    },
    {
      id: "gw_6c8d19",
      timestamp: "8s ago",
      model: "gemini-1.5-flash",
      provider: "gemini",
      downgradedTo: null,
      savedAmount: null,
      savedPct: null,
      inputTokens: 512,
      outputTokens: 64,
      totalTokens: 576,
      latencyMs: 38,
      proxyOverheadMs: 1.2,
      costUsd: 0.00006,
      status: 200,
      governanceAction: "passthrough",
      promptPreview: "Validate schema boundaries for distributed Redis rate limiters...",
    },
    {
      id: "gw_5b7a01",
      timestamp: "12s ago",
      model: "gpt-4o",
      provider: "openai",
      downgradedTo: "gpt-4o-mini",
      savedAmount: "$0.00412",
      savedPct: "-95.0%",
      inputTokens: 320,
      outputTokens: 95,
      totalTokens: 415,
      latencyMs: 41,
      proxyOverheadMs: 1.7,
      costUsd: 0.00010,
      status: 200,
      governanceAction: "auto-downgraded",
      promptPreview: "Compute hierarchical tenant spend allocation matrix...",
    },
  ]);

  // Dynamic telemetry metrics
  const [totalRequests, setTotalRequests] = useState(1482);
  const [totalSavings, setTotalSavings] = useState(48.24);

  // Live stream interval simulator
  useEffect(() => {
    if (!isStreaming) return;

    const templates = [
      {
        model: "gpt-4o",
        provider: "openai" as const,
        downgradedTo: "gpt-4o-mini",
        savedAmount: "$0.00392",
        savedPct: "-94.5%",
        inputTokens: 160,
        outputTokens: 75,
        totalTokens: 235,
        latencyMs: 46,
        costUsd: 0.00008,
        governanceAction: "auto-downgraded" as const,
        promptPreview: "Evaluate multi-region failover conditions for API key routing...",
      },
      {
        model: "gemini-1.5-flash",
        provider: "gemini" as const,
        downgradedTo: null,
        savedAmount: null,
        savedPct: null,
        inputTokens: 240,
        outputTokens: 110,
        totalTokens: 350,
        latencyMs: 32,
        costUsd: 0.00004,
        governanceAction: "passthrough" as const,
        promptPreview: "Format incoming telemetry into RFC 7807 problem details...",
      },
      {
        model: "kimi-k1.5",
        provider: "kimi" as const,
        downgradedTo: null,
        savedAmount: null,
        savedPct: null,
        inputTokens: 410,
        outputTokens: 180,
        totalTokens: 590,
        latencyMs: 91,
        costUsd: 0.00085,
        governanceAction: "passthrough" as const,
        promptPreview: "Run FinOps token pricing verification across moonshot models...",
      },
      {
        model: "claude-3-5-haiku-20241022",
        provider: "anthropic" as const,
        downgradedTo: null,
        savedAmount: null,
        savedPct: null,
        inputTokens: 190,
        outputTokens: 85,
        totalTokens: 275,
        latencyMs: 55,
        costUsd: 0.00049,
        governanceAction: "passthrough" as const,
        promptPreview: "Check secret credential decryption in server-side AES vault...",
      },
    ];

    const timer = setInterval(() => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const newId = `gw_${Math.random().toString(16).slice(2, 8)}`;
      const newLog: LiveProxyLog = {
        id: newId,
        timestamp: "Just now",
        ...template,
        proxyOverheadMs: +(1.2 + Math.random() * 1.1).toFixed(1),
        status: 200,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 7)]);
      setTotalRequests((prev) => prev + 1);
      if (template.savedAmount) {
        setTotalSavings((prev) => +(prev + 0.0039).toFixed(2));
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [isStreaming]);

  // Dispatch manual probe request
  const handleFireProbe = () => {
    const probeId = `gw_probe_${Math.random().toString(16).slice(2, 6)}`;
    const probeLog: LiveProxyLog = {
      id: probeId,
      timestamp: "Just now",
      model: "gpt-4o",
      provider: "openai",
      downgradedTo: "gpt-4o-mini",
      savedAmount: "$0.00418",
      savedPct: "-95.2%",
      inputTokens: 185,
      outputTokens: 92,
      totalTokens: 277,
      latencyMs: 39,
      proxyOverheadMs: 1.4,
      costUsd: 0.00008,
      status: 200,
      governanceAction: "auto-downgraded",
      promptPreview: "Client manual probe dispatched from OsterdOps Hero Perimeter...",
    };

    setLogs((prev) => [probeLog, ...prev.slice(0, 7)]);
    setHoveredLog(probeLog);
    setTotalRequests((prev) => prev + 1);
    setTotalSavings((prev) => +(prev + 0.0042).toFixed(2));
  };

  const filteredLogs = logs.filter((log) => {
    if (filterProvider === "all") return true;
    return log.provider === filterProvider;
  });

  const getProviderIcon = (provider: LiveProxyLog["provider"]) => {
    switch (provider) {
      case "openai":
        return <OpenAILogo className="w-3.5 h-3.5 text-white" />;
      case "anthropic":
        return <AnthropicLogo className="w-3.5 h-3.5 text-[#DFB277]" />;
      case "gemini":
        return <GoogleGeminiLogo className="w-3.5 h-3.5 text-white" />;
      case "kimi":
        return <KimiLogo className="w-3.5 h-3.5 text-white" />;
      case "meta":
        return <MetaLlamaLogo className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[420px] bg-gradient-to-b from-[#DFB277]/10 via-[#DFB277]/[0.02] to-transparent blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badging & Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono text-[#DFB277]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-semibold tracking-wide uppercase">ACTIVE FINOPS PERIMETER &amp; AI GATEWAY</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">SUB-5MS SLA</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Stop Passive Logging.{" "}
            <br className="hidden sm:inline" />
            Take Active Control of Your{" "}
            <span className="bg-gradient-to-r from-[#DFB277] via-[#F3D7A8] to-[#DFB277] bg-clip-text text-transparent">
              AI Perimeter.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-sans">
            The sub-5ms intelligent proxy gateway that actively halts runaway agent loops, enforces hierarchical hard spend ceilings, and dynamically downgrades models before budgets breach.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-sm font-mono transition-all shadow-[0_0_25px_rgba(223,178,119,0.25)] hover:shadow-[0_0_35px_rgba(223,178,119,0.4)] cursor-pointer"
            >
              <span>Deploy AI Perimeter Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0E0E0E] hover:bg-[#161616] border border-[#1A1A1A] hover:border-[#DFB277]/50 text-white font-medium text-sm font-mono transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#DFB277] fill-[#DFB277]" />
              <span>Live Interactive Simulator</span>
            </a>
          </div>

          {/* Quick Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-400 font-mono pt-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              1-Line OpenAI Drop-in
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              Zero Raw Prompt Egress
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              No Credit Card Required
            </span>
          </div>
        </div>

        {/* =========================================================================
            LIVE INTERACTIVE PROXY DASHBOARD (HERO CENTERPIECE)
            Enables full hover inspection, real-time streaming, and interactive probe
           ========================================================================= */}
        <div className="mt-12 lg:mt-16 max-w-6xl mx-auto">
          <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden transition-all">
            {/* Dashboard Browser Frame Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                  <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                  <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-xs font-mono text-neutral-400">
                  <Terminal className="w-3 h-3 text-[#DFB277]" />
                  <span className="text-white font-medium">https://gateway.osterdops.com/v1</span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-[#DFB277]">chat/completions</span>
                </div>
              </div>

              {/* Action Controls & Live Status Pill */}
              <div className="flex items-center gap-2.5">
                {/* Fire Probe Button */}
                <button
                  type="button"
                  onClick={handleFireProbe}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DFB277]/15 hover:bg-[#DFB277]/25 border border-[#DFB277]/40 text-[#DFB277] text-xs font-mono font-bold transition-all cursor-pointer"
                  title="Fire a real-time probe through the proxy to inspect inline metrics"
                >
                  <Zap className="w-3.5 h-3.5 fill-[#DFB277]" />
                  <span>Send Proxy Probe</span>
                </button>

                {/* Pause/Play Stream */}
                <button
                  type="button"
                  onClick={() => setIsStreaming(!isStreaming)}
                  className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#222222] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title={isStreaming ? "Pause live streaming" : "Resume live streaming"}
                >
                  {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                {/* Status Pill */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[11px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Circuit Closed</span>
                </div>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-4 sm:p-6 space-y-5">
              {/* 4 Interactive KPI Stat Cards with Hover Glow */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Inline Overhead */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#DFB277]/50 hover:bg-[#0D0D0D] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Inline Proxy Overhead</span>
                    <Clock className="w-3.5 h-3.5 text-[#DFB277] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>1.8ms</span>
                    <span className="text-xs text-[#10B981] font-normal">P95 &lt; 3.2ms</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">O(1) in-memory LRU cache</div>
                </div>

                {/* Card 2: Total Requests */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#10B981]/50 hover:bg-[#0D0D0D] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Live Requests Metered</span>
                    <Activity className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>{totalRequests.toLocaleString()}</span>
                    <span className="text-xs text-[#10B981] font-normal">100% SLA</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">0.00% error rate</div>
                </div>

                {/* Card 3: Auto-Downgrade Savings */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#DFB277]/50 hover:bg-[#0D0D0D] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">FinOps Auto-Downgrade</span>
                    <Coins className="w-3.5 h-3.5 text-[#DFB277] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>${totalSavings.toFixed(2)}</span>
                    <span className="text-xs text-[#10B981] font-normal">-94.2% saved</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">gpt-4o $\rightarrow$ gpt-4o-mini</div>
                </div>

                {/* Card 4: Runaway Loop Guard */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-cyan-500/50 hover:bg-[#0D0D0D] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Runaway Loop Guard</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>Active Perimeter</span>
                    <span className="text-xs text-[#10B981] font-normal">0 Trips</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">30s velocity window (15 max)</div>
                </div>
              </div>

              {/* Live Proxy Stream Area with Interactive Hover Drawer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Stream List (7 cols) */}
                <div className="lg:col-span-7 rounded-xl bg-[#080808] border border-[#161616] p-4 space-y-3">
                  {/* Stream Header & Filter Pills */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#161616]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#DFB277]" />
                      <span className="text-xs font-bold font-mono text-white uppercase tracking-wide">
                        Live Gateway Transaction Stream
                      </span>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1">
                      {(["all", "openai", "anthropic", "gemini", "kimi"] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setFilterProvider(prov)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                            filterProvider === prov
                              ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                              : "text-neutral-400 hover:text-white hover:bg-[#161616]"
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logs Table */}
                  <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                    {filteredLogs.map((log) => {
                      const isHovered = hoveredLog?.id === log.id;
                      return (
                        <div
                          key={log.id}
                          onMouseEnter={() => setHoveredLog(log)}
                          onClick={() => setHoveredLog(log)}
                          className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isHovered
                              ? "bg-[#141414] border-[#DFB277] shadow-[0_0_20px_rgba(223,178,119,0.12)] scale-[1.01]"
                              : "bg-[#0A0A0A] border-[#161616] hover:border-[#262626] hover:bg-[#0E0E0E]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Provider Logo */}
                            <div className="w-6 h-6 rounded-md bg-[#121212] border border-[#222222] flex items-center justify-center shrink-0">
                              {getProviderIcon(log.provider)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="text-white font-medium truncate">{log.model}</span>
                                {log.downgradedTo && (
                                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
                                    <ChevronRight className="w-3 h-3 text-neutral-500" />
                                    <span className="font-bold">{log.downgradedTo}</span>
                                    <span className="px-1 py-0.2 rounded bg-[#10B981]/15 text-[9px]">
                                      {log.savedPct}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[240px]">
                                {log.promptPreview}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                            <span className="text-neutral-400 hidden sm:inline">{log.totalTokens} tok</span>
                            <span className="text-neutral-400">{log.latencyMs}ms</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold">
                              200 OK
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#161616] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                      Hover any row to inspect wire telemetry
                    </span>
                    <span>Displaying {filteredLogs.length} recent calls</span>
                  </div>
                </div>

                {/* Right Interactive Telemetry Inspector Drawer (5 cols) */}
                <div className="lg:col-span-5 rounded-xl bg-[#080808] border border-[#161616] p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#DFB277]" />
                        <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                          Inline Request Inspector
                        </span>
                      </div>
                      {hoveredLog && (
                        <span className="text-[10px] font-mono text-[#DFB277] bg-[#DFB277]/10 px-2 py-0.5 rounded border border-[#DFB277]/30">
                          {hoveredLog.id}
                        </span>
                      )}
                    </div>

                    {hoveredLog ? (
                      <div className="pt-3 space-y-3">
                        {/* Status banner */}
                        {hoveredLog.governanceAction === "auto-downgraded" ? (
                          <div className="p-2.5 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-1.5 text-[#DFB277] font-bold">
                              <TrendingDown className="w-4 h-4" />
                              <span>FinOps Model Downgrade Applied</span>
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              Original target <span className="line-through text-neutral-500">{hoveredLog.model}</span> was dynamically rewritten to <span className="text-[#10B981] font-bold">{hoveredLog.downgradedTo}</span>.
                            </div>
                            <div className="text-[11px] text-[#10B981] font-semibold">
                              Immediate Savings: {hoveredLog.savedPct} ({hoveredLog.savedAmount})
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Clean Perimeter Passthrough</span>
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              Budget headroom healthy. Request dispatched to {hoveredLog.model}.
                            </div>
                          </div>
                        )}

                        {/* Telemetry Metrics Table */}
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                            <span className="text-neutral-400">Total Latency:</span>
                            <span className="text-white font-bold">{hoveredLog.latencyMs}ms</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                            <span className="text-neutral-400">OsterdOps Pre-flight Overhead:</span>
                            <span className="text-[#10B981] font-bold">{hoveredLog.proxyOverheadMs}ms (Sub-5ms SLA)</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                            <span className="text-neutral-400">Tokens (In / Out / Total):</span>
                            <span className="text-neutral-200">
                              {hoveredLog.inputTokens} / {hoveredLog.outputTokens} ({hoveredLog.totalTokens} tok)
                            </span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                            <span className="text-neutral-400">Calculated Cost:</span>
                            <span className="text-[#DFB277] font-bold">${hoveredLog.costUsd.toFixed(6)}</span>
                          </div>
                        </div>

                        {/* Simulated Response Headers */}
                        <div className="p-2 rounded bg-[#0A0A0A] border border-[#161616] space-y-1">
                          <div className="text-[10px] font-mono uppercase text-neutral-500">
                            Attached Response Headers:
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 space-y-0.5">
                            <div>x-osterdops-governance: {hoveredLog.governanceAction}</div>
                            <div>x-osterdops-active-model: {hoveredLog.downgradedTo || hoveredLog.model}</div>
                            <div>x-osterdops-proxy-latency: {hoveredLog.proxyOverheadMs}ms</div>
                            <div>x-osterdops-sha256: verified</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1A1A1A] rounded-lg text-xs font-mono text-neutral-500 space-y-2">
                        <Activity className="w-6 h-6 text-neutral-600 animate-pulse" />
                        <span>Hover over any transaction row in the live feed to inspect its microsecond telemetry</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-400">Live Telemetry WebSocket:</span>
                    <span className="text-[#10B981] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                      Connected (wss://)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
