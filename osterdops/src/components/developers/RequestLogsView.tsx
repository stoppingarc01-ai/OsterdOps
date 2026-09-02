"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Coins,
  ShieldCheck,
  EyeOff,
  Layers,
  ChevronRight,
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  provider: "openai" | "anthropic" | "gemini";
  model: string;
  statusCode: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUsd: number;
  stream: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export function RequestLogsView() {
  const { currentOrg, getIdToken } = useAuth();
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeInspectorLog, setActiveInspectorLog] = useState<RequestLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchLogs() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>("/api/v1/usage", {
          params: { organizationId: currentOrg.id, limit: 50 },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: RequestLogEntry[] = res.data.map((u: any) => {
            let prov: "openai" | "anthropic" | "gemini" = "openai";
            const p = (u.provider || "").toLowerCase();
            if (p.includes("anthropic")) prov = "anthropic";
            else if (p.includes("gemini") || p.includes("google")) prov = "gemini";

            return {
              id: u.id,
              timestamp: u.createdAt
                ? new Date(u.createdAt).toISOString().replace("T", " ").slice(0, 19)
                : new Date().toISOString().replace("T", " ").slice(0, 19),
              provider: prov,
              model: u.model || "unknown",
              statusCode: u.statusCode ?? (u.status === "SUCCESS" ? 200 : 500),
              latencyMs: u.latencyMs ?? 0,
              inputTokens: u.tokensPrompt ?? 0,
              outputTokens: u.tokensCompletion ?? 0,
              cachedTokens: u.tokensCached ?? 0,
              costUsd: u.estimatedCostUsd ?? u.estimatedCost ?? 0,
              stream: Boolean(u.stream),
              errorCode: u.errorCode,
              errorMessage: u.errorMessage,
            };
          });
          setLogs(mapped);
        } else {
          setLogs([]);
        }
      } catch (err) {
        if (isMounted) setLogs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim() && !log.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedProvider !== "all" && log.provider !== selectedProvider) {
      return false;
    }
    if (selectedStatus === "success" && log.statusCode !== 200) {
      return false;
    }
    if (selectedStatus === "error" && log.statusCode === 200) {
      return false;
    }
    return true;
  });

  const copyRequestId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#73788c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111422] border border-[#1d2136] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#73788c]" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-[#111422] border border-[#1d2136] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#111422] border border-[#1d2136] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="success">200 OK Only</option>
              <option value="error">Errors & Throttles</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "request-logs.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141726] border border-[#232738] text-xs font-semibold text-[#c5c9d6] hover:text-white hover:border-[#dfba82]/40 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Aggregating proxy logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#73788c] bg-[#090b12] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">No request logs recorded</div>
              <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
                Once requests are routed through the OsterdOps Proxy Gateway, live execution traces will display here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#161824] bg-[#0f111c] text-[10.5px] uppercase tracking-wider text-[#6e7387]">
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Request ID</th>
                  <th className="py-3 px-4 font-semibold">Timestamp (UTC)</th>
                  <th className="py-3 px-4 font-semibold">Provider & Model</th>
                  <th className="py-3 px-4 font-semibold">Mode</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Tokens (In / Out)</th>
                  <th className="py-3 px-4 font-semibold">Estimated Cost</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161928] font-mono">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveInspectorLog(log)}
                    className="hover:bg-[#111422]/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold border ${
                          log.statusCode === 200
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/30"
                            : log.statusCode === 429
                            ? "bg-amber-950/60 text-amber-400 border-amber-800/30"
                            : "bg-rose-950/60 text-rose-400 border-rose-800/30"
                        }`}
                      >
                        {log.statusCode === 200 ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : log.statusCode === 429 ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{log.statusCode}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{log.id}</td>
                    <td className="py-3.5 px-4 text-[#8e93a6] font-sans text-[11px]">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-white">{log.model}</div>
                      <div className="text-[10px] text-[#73788c] uppercase">{log.provider}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          log.stream ? "bg-blue-950/60 text-blue-400" : "bg-[#161928] text-[#8e93a6]"
                        }`}
                      >
                        {log.stream ? "SSE Stream" : "Unary"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white">{log.latencyMs}ms</td>
                    <td className="py-3.5 px-4 text-[#8e93a6]">
                      {log.inputTokens} / {log.outputTokens}
                      {log.cachedTokens > 0 && (
                        <span className="text-purple-400 text-[10px] ml-1">({log.cachedTokens} cached)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#dfba82] font-bold">
                      {log.costUsd > 0 ? `$${log.costUsd.toFixed(6)}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="text-[#73788c] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-Over Request Inspector Modal */}
      {activeInspectorLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#0c0e17] border-l border-[#1b1e2c] h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1b1e2c]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#dfba82]" />
                  <h2 className="text-base font-bold text-white font-serif">Request Telemetry Details</h2>
                </div>
                <button
                  onClick={() => setActiveInspectorLog(null)}
                  className="text-[#73788c] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  activeInspectorLog.statusCode === 200
                    ? "bg-emerald-950/40 border-emerald-800/30 text-emerald-400"
                    : "bg-rose-950/40 border-rose-800/30 text-rose-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {activeInspectorLog.statusCode === 200 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>HTTP {activeInspectorLog.statusCode}</span>
                </div>
                <span className="text-xs font-mono">{activeInspectorLog.latencyMs}ms elapsed</span>
              </div>

              {/* Key Values */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#161928]">
                  <span className="text-[#73788c]">Request ID</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <span>{activeInspectorLog.id}</span>
                    <button
                      onClick={() => copyRequestId(activeInspectorLog.id)}
                      className="p-1 hover:text-[#dfba82]"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#161928]">
                  <span className="text-[#73788c]">Provider / Model</span>
                  <span className="text-white">
                    {activeInspectorLog.provider.toUpperCase()} · {activeInspectorLog.model}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#161928]">
                  <span className="text-[#73788c]">Input Tokens</span>
                  <span className="text-white">{activeInspectorLog.inputTokens}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#161928]">
                  <span className="text-[#73788c]">Output Tokens</span>
                  <span className="text-white">{activeInspectorLog.outputTokens}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#161928]">
                  <span className="text-[#73788c]">Estimated Cost</span>
                  <span className="text-[#dfba82] font-bold">${activeInspectorLog.costUsd.toFixed(6)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveInspectorLog(null)}
              className="w-full py-2.5 bg-[#141726] hover:bg-[#1a1e32] border border-[#232738] rounded-xl text-xs font-semibold text-white"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
