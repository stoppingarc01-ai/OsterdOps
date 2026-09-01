"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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

const SAMPLE_LOGS: RequestLogEntry[] = [
  {
    id: "gw_req_01j9a8b1",
    timestamp: "2026-08-31 20:54:12",
    provider: "openai",
    model: "gpt-4o-mini",
    statusCode: 200,
    latencyMs: 312,
    inputTokens: 142,
    outputTokens: 85,
    cachedTokens: 64,
    costUsd: 0.000072,
    stream: true,
  },
  {
    id: "gw_req_01j9a8b2",
    timestamp: "2026-08-31 20:53:48",
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    statusCode: 200,
    latencyMs: 468,
    inputTokens: 420,
    outputTokens: 160,
    cachedTokens: 128,
    costUsd: 0.00366,
    stream: true,
  },
  {
    id: "gw_req_01j9a8b3",
    timestamp: "2026-08-31 20:51:20",
    provider: "gemini",
    model: "gemini-1.5-flash",
    statusCode: 200,
    latencyMs: 198,
    inputTokens: 250,
    outputTokens: 60,
    cachedTokens: 0,
    costUsd: 0.000044,
    stream: false,
  },
  {
    id: "gw_req_01j9a8b4",
    timestamp: "2026-08-31 20:48:05",
    provider: "openai",
    model: "gpt-4o",
    statusCode: 429,
    latencyMs: 65,
    inputTokens: 0,
    outputTokens: 0,
    cachedTokens: 0,
    costUsd: 0,
    stream: false,
    errorCode: "PROVIDER_RATE_LIMITED",
    errorMessage: "Upstream rate limit reached for 'openai'.",
  },
  {
    id: "gw_req_01j9a8b5",
    timestamp: "2026-08-31 20:45:30",
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    statusCode: 504,
    latencyMs: 30000,
    inputTokens: 0,
    outputTokens: 0,
    cachedTokens: 0,
    costUsd: 0,
    stream: true,
    errorCode: "TIMEOUT",
    errorMessage: "Upstream AI provider request timed out after server deadline.",
  },
];

export function RequestLogsView() {
  const [logs] = useState<RequestLogEntry[]>(SAMPLE_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeInspectorLog, setActiveInspectorLog] = useState<RequestLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState(false);

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
      {/* Privacy Guarantee Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0c0e17] border border-emerald-800/30 flex items-start gap-3 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[#8e93a6] leading-relaxed">
          <span className="font-bold text-white font-serif">Zero Payload Persistence:</span> Request logs record ONLY
          operational metrics (latency, token breakdown, status codes, estimated cost, and correlation IDs). Prompts,
          system instructions, and completions are NEVER stored or inspectable.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#73788c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Request ID (gw_req_...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-white placeholder-[#73788c] focus:outline-none focus:border-[#dfba82]/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
          >
            <option value="all">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success (200 OK)</option>
            <option value="error">Errors (4xx, 5xx)</option>
          </select>
        </div>
      </div>

      {/* Request Logs Table */}
      <div className="rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b1e2c] text-[#8e93a6] bg-[#111422]/50">
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
                <div className="flex items-center gap-2 font-bold font-mono">
                  <span>HTTP {activeInspectorLog.statusCode}</span>
                  <span>{activeInspectorLog.statusCode === 200 ? "SUCCESS" : activeInspectorLog.errorCode}</span>
                </div>
                <div className="font-mono text-xs text-white">{activeInspectorLog.latencyMs}ms</div>
              </div>

              {/* Request ID with Copy Button */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#8e93a6] uppercase font-semibold">Correlation ID</span>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] flex items-center justify-between font-mono text-xs text-white">
                  <span>{activeInspectorLog.id}</span>
                  <button
                    onClick={() => copyRequestId(activeInspectorLog.id)}
                    className="text-[#73788c] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">AI Provider</span>
                  <span className="font-bold text-white uppercase">{activeInspectorLog.provider}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">Model Name</span>
                  <span className="font-bold text-white">{activeInspectorLog.model}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">Prompt Tokens</span>
                  <span className="font-mono text-white">{activeInspectorLog.inputTokens}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">Output Tokens</span>
                  <span className="font-mono text-white">{activeInspectorLog.outputTokens}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">Prompt Cache Tokens</span>
                  <span className="font-mono text-purple-400">{activeInspectorLog.cachedTokens}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
                  <span className="text-[10px] text-[#73788c] block uppercase">Estimated Spend</span>
                  <span className="font-mono text-[#dfba82] font-bold">
                    ${activeInspectorLog.costUsd.toFixed(6)}
                  </span>
                </div>
              </div>

              {/* Error Explanation if Failed */}
              {activeInspectorLog.errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/30 space-y-2 text-xs">
                  <div className="font-bold text-rose-400">Error Classification</div>
                  <p className="text-white font-mono">{activeInspectorLog.errorMessage}</p>
                </div>
              )}

              {/* Privacy Shield Seal */}
              <div className="p-4 rounded-xl bg-[#08090f] border border-[#161928] flex items-center gap-3 text-xs text-[#73788c]">
                <EyeOff className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Prompt & completion contents were purged from volatile memory immediately after gateway delivery.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1b1e2c]">
              <button
                onClick={() => setActiveInspectorLog(null)}
                className="w-full py-2 rounded-xl bg-[#111422] hover:bg-[#161928] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
