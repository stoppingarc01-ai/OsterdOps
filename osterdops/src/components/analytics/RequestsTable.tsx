"use client";

import React from "react";
import Link from "next/link";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import type { UsageRecord } from "@/types";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Coins,
  Cpu,
  Terminal,
} from "lucide-react";

interface RequestsTableProps {
  requests: UsageRecord[];
  isLoading?: boolean;
  maxRows?: number;
}

export function RequestsTable({ requests = [], isLoading = false, maxRows = 25 }: RequestsTableProps) {
  const displayRows = maxRows ? requests.slice(0, maxRows) : requests;

  const formatTime = (ts?: unknown) => {
    if (!ts) return "—";
    try {
      let d: Date;
      if (typeof ts === "string") {
        d = new Date(ts);
      } else if (typeof ts === "object" && ts !== null && "toDate" in ts && typeof (ts as { toDate: () => Date }).toDate === "function") {
        d = (ts as { toDate: () => Date }).toDate();
      } else {
        d = new Date(String(ts));
      }
      const diffMs = Date.now() - d.getTime();
      if (diffMs < 60000) return `${Math.max(1, Math.floor(diffMs / 1000))}s ago`;
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return String(ts);
    }
  };

  const getStatusBadge = (statusCode: number, status?: string) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
          <CheckCircle2 className="w-3 h-3" />
          {statusCode} OK
        </span>
      );
    }
    if (statusCode === 429) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#DFB277]/10 text-[#DFB277] border border-[#DFB277]/30">
          <AlertTriangle className="w-3 h-3" />
          429 Rate Limit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-800/30">
        <XCircle className="w-3 h-3" />
        {statusCode || 500} Error
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#D4A362]" />
          <h3 className="text-sm font-bold text-white">Live Request Stream</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-[#D4A362] border border-[#222222]">
            {requests.length} logged
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Table Content */}
      {displayRows.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-[#D4A362]">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-white">No gateway traffic detected yet</div>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Copy your 1-line proxy snippet or send a completion request to see real-time transactions stream live.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/models"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DFB277] text-[#0E0E0E] text-xs font-semibold hover:bg-[#E5C38E] transition-all"
            >
              <span>Explore Model Catalog & Snippets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#161616] bg-[#0A0A0A] text-[11px] text-neutral-500 uppercase">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Model</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Latency</th>
                <th className="py-3 px-4 font-medium text-right">Prompt / Completion</th>
                <th className="py-3 px-4 font-medium text-right">Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {displayRows.map((req) => {
                const costDisplay = req.costUsd !== undefined && req.costUsd !== null
                  ? `$${req.costUsd.toFixed(5)}`
                  : "$0.00000";

                return (
                  <tr
                    key={req.id || req.requestId}
                    className="hover:bg-[#121212] transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-600" />
                      <span>{formatTime(req.timestamp)}</span>
                    </td>

                    {/* Model & Provider */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ModelProviderLogo provider={req.provider} modelId={req.model} size="sm" />
                        <div>
                          <span className="text-white font-semibold group-hover:text-[#E5C38E] transition-colors">
                            {req.model}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase block">
                            {req.provider}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Code */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(req.statusCode, req.status)}
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-4 whitespace-nowrap text-right text-neutral-300">
                      {req.latencyMs > 0 ? `${req.latencyMs}ms` : "—"}
                    </td>

                    {/* Tokens */}
                    <td className="py-3 px-4 whitespace-nowrap text-right text-neutral-300">
                      <span className="text-neutral-400">{req.inputTokens.toLocaleString()}</span>
                      <span className="text-neutral-600 mx-1">/</span>
                      <span className="text-white font-semibold">{req.outputTokens.toLocaleString()}</span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-bold text-[#E5C38E]">
                      {costDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
