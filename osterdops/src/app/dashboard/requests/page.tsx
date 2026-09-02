"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  ChevronDown,
  RotateCw,
  SlidersHorizontal,
  Globe,
  ShieldCheck,
  Clock,
  Cpu,
  Coins,
  Download,
  Zap,
  Check,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface RequestItem {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  statusCode: number;
  latencyMs: number;
  tokens: number;
  costUsd: number;
  promptTokens?: number;
  completionTokens?: number;
}

export default function GatewayPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "errors" | "timeouts" | "retries">("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>("all");

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);

  // KPIs
  const [totalRequests, setTotalRequests] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [avgLatency, setAvgLatency] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);

  const fetchLiveUsage = async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const [usageRes, analyticsRes] = await Promise.all([
        apiRequest<any[]>("/api/v1/usage", {
          params: { organizationId: currentOrg.id, limit: 50 },
          token,
        }),
        apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        }),
      ]);

      if (analyticsRes.data && analyticsRes.data.kpis) {
        const k = analyticsRes.data.kpis;
        setTotalRequests(k.totalRequests ?? 0);
        setSuccessRate(k.successRatePercent ?? 100);
        setAvgLatency(Math.round(k.averageLatencyMs ?? 0));
        setTotalTokens(k.totalTokens ?? 0);
        setTotalSpend(k.totalSpendUsd ?? 0);
      }

      if (usageRes.data && Array.isArray(usageRes.data)) {
        const mapped: RequestItem[] = usageRes.data.map((u: any) => ({
          id: u.id,
          timestamp: u.createdAt
            ? new Date(u.createdAt).toISOString().replace("T", " ").slice(0, 19)
            : new Date().toISOString().replace("T", " ").slice(0, 19),
          model: u.model || "unknown",
          provider: u.provider || "OpenAI",
          statusCode: u.statusCode ?? (u.status === "SUCCESS" ? 200 : 500),
          latencyMs: u.latencyMs ?? 0,
          tokens: u.totalTokens ?? (u.tokensPrompt ?? 0) + (u.tokensCompletion ?? 0),
          costUsd: u.estimatedCostUsd ?? u.estimatedCost ?? 0,
          promptTokens: u.tokensPrompt ?? 0,
          completionTokens: u.tokensCompletion ?? 0,
        }));
        setRequests(mapped);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveUsage();
  }, [currentOrg?.id, getIdToken]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase());

    const matchesProvider =
      selectedProviderFilter === "all" || r.provider.toLowerCase() === selectedProviderFilter.toLowerCase();

    if (activeTab === "errors") {
      return matchesSearch && matchesProvider && r.statusCode >= 400;
    }
    if (activeTab === "timeouts") {
      return matchesSearch && matchesProvider && (r.statusCode === 504 || r.latencyMs > 5000);
    }
    return matchesSearch && matchesProvider;
  });

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
                  <span>GATEWAY</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">REQUESTS</span>
                </div>

                {/* Title with Live Indicator */}
                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    API Gateway Request Stream
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
                    Live Proxy
                  </span>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Real-time telemetry and traces for all calls traversing the OsterdOps Proxy.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={fetchLiveUsage}
                  title="Refresh metrics"
                  className={`p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer ${
                    loading ? "animate-spin text-[#dfba82]" : ""
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter by ID, model, provider..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50 transition-all"
                  />
                </div>

                {/* Filters Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs font-medium text-[#c5c9d6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e93a6]" />
                    <span>Filters</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dfba82]" />
                  </button>
                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#0e1018] border border-[#232738] p-1.5 shadow-2xl z-30 text-xs">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6b7082]">
                        Filter Provider
                      </div>
                      {["all", "OpenAI", "Anthropic", "Gemini"].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => {
                            setSelectedProviderFilter(prov);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                            selectedProviderFilter === prov
                              ? "bg-[#dfba82]/15 text-[#dfba82]"
                              : "text-[#c5c9d6] hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          <span className="capitalize">{prov}</span>
                          {selectedProviderFilter === prov && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5 Top Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Requests */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Total Requests</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {totalRequests.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Gateway 30d Volume</div>
                </div>
              </div>

              {/* Card 2: Success Rate */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Success Rate</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {successRate}%
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">HTTP 2xx</div>
                </div>
              </div>

              {/* Card 3: Avg Latency */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Avg Latency</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {avgLatency}ms
                  </div>
                  <div className="text-[10.5px] text-blue-400 font-medium">End-to-end response</div>
                </div>
              </div>

              {/* Card 4: Total Tokens */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Total Tokens</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {totalTokens >= 1_000_000 ? `${(totalTokens / 1_000_000).toFixed(1)}M` : totalTokens.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Metered throughput</div>
                </div>
              </div>

              {/* Card 5: Incurred Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-[#dfba82]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Incurred Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${totalSpend.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-[#dfba82] font-medium">Proxy spend</div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] shadow-xl overflow-hidden">
              {/* Table Header Controls */}
              <div className="p-4 border-b border-[#161824] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#141624] border border-[#23273a] text-xs">
                  {(["all", "errors", "timeouts"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer capitalize ${
                        activeTab === tab
                          ? "bg-[#dfba82] text-black font-bold shadow-[0_0_10px_rgba(223,186,130,0.25)]"
                          : "text-[#8e93a6] hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Export Button */}
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(requests, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "osterdops-gateway-requests.json");
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

              {/* Table Data or Empty State */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                    <div>Loading live gateway request stream...</div>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#73788c] bg-[#090b12] space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-semibold text-white">No API requests recorded</div>
                    <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
                      Route application LLM traffic through the OsterdOps Proxy Gateway at <code>/api/v1/gateway/chat</code> to inspect live execution traces.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[11px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Request ID</th>
                        <th className="py-3 px-4">Timestamp (UTC)</th>
                        <th className="py-3 px-4">Provider / Model</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Latency</th>
                        <th className="py-3 px-4">Tokens</th>
                        <th className="py-3 px-4 text-right">Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {filteredRequests.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRequest(item)}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-mono text-[#dfba82] font-medium text-[11.5px]">
                            {item.id}
                          </td>
                          <td className="py-3.5 px-4 text-[#8e93a6] font-mono text-[11px] whitespace-nowrap">
                            {item.timestamp}
                          </td>
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-bold text-white text-xs">{item.provider}</div>
                              <div className="text-[11px] font-mono text-[#73788c] mt-0.5">{item.model}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {item.statusCode === 200 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>200 OK</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{item.statusCode}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap">
                            {item.latencyMs}ms
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#c5c9d6]">
                            {item.tokens.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#dfba82]">
                            ${item.costUsd.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0c0e16] border-l border-[#1b1e2c] p-6 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2c]">
                <h3 className="text-sm font-bold text-white">Request Trace Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg text-[#8e93a6] hover:text-white hover:bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Request ID:</span>
                  <span className="text-white">{selectedRequest.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Timestamp:</span>
                  <span className="text-white">{selectedRequest.timestamp}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Model:</span>
                  <span className="text-white">{selectedRequest.model}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Provider:</span>
                  <span className="text-white">{selectedRequest.provider}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Status Code:</span>
                  <span className="text-white">{selectedRequest.statusCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Latency:</span>
                  <span className="text-white">{selectedRequest.latencyMs}ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Prompt Tokens:</span>
                  <span className="text-white">{selectedRequest.promptTokens?.toLocaleString() ?? "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Completion Tokens:</span>
                  <span className="text-white">{selectedRequest.completionTokens?.toLocaleString() ?? "0"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141624]">
                  <span className="text-[#8e93a6]">Cost (USD):</span>
                  <span className="text-[#dfba82] font-bold">${selectedRequest.costUsd.toFixed(5)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-2 bg-[#141624] hover:bg-[#1a1d2e] border border-[#232738] rounded-xl text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
