"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Activity, Search, Filter, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react";

interface RequestItem {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  statusCode: number;
  latencyMs: number;
  tokens: number;
  costUsd: number;
}

const SAMPLE_REQUESTS: RequestItem[] = [
  { id: "req_01j9a8b1", timestamp: "2026-08-29 10:32:15", model: "gpt-4o", provider: "OpenAI", statusCode: 200, latencyMs: 340, tokens: 420, costUsd: 0.00315 },
  { id: "req_01j9a8b2", timestamp: "2026-08-29 10:31:58", model: "claude-3-5-sonnet", provider: "Anthropic", statusCode: 200, latencyMs: 480, tokens: 810, costUsd: 0.00648 },
  { id: "req_01j9a8b3", timestamp: "2026-08-29 10:31:22", model: "gemini-1.5-pro", provider: "Gemini", statusCode: 200, latencyMs: 290, tokens: 350, costUsd: 0.00175 },
  { id: "req_01j9a8b4", timestamp: "2026-08-29 10:30:45", model: "gpt-4o-mini", provider: "OpenAI", statusCode: 200, latencyMs: 180, tokens: 190, costUsd: 0.00019 },
  { id: "req_01j9a8b5", timestamp: "2026-08-29 10:29:10", model: "gpt-4o", provider: "OpenAI", statusCode: 429, latencyMs: 45, tokens: 0, costUsd: 0.00000 },
];

export default function RequestsPage() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_REQUESTS.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  Live Stream
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Request Activity & Telemetry
                </h1>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] w-full sm:w-64">
                <Search className="w-4 h-4 text-[#73788c]" />
                <input
                  type="text"
                  placeholder="Filter by ID, model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-[#555a6d] w-full"
                />
              </div>
            </div>

            {/* Requests Table */}
            <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3.5 font-semibold">Request ID</th>
                      <th className="p-3.5 font-semibold">Timestamp (UTC)</th>
                      <th className="p-3.5 font-semibold">Provider / Model</th>
                      <th className="p-3.5 font-semibold">Status</th>
                      <th className="p-3.5 font-semibold">Latency</th>
                      <th className="p-3.5 font-semibold">Tokens</th>
                      <th className="p-3.5 font-semibold text-right">Cost (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-mono text-[#dfba82] font-medium">{item.id}</td>
                        <td className="p-3.5 text-[#8e93a6]">{item.timestamp}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{item.provider}</div>
                          <div className="text-[11px] font-mono text-[#73788c]">{item.model}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              item.statusCode === 200
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : item.statusCode === 429
                                ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                                : "bg-red-950/60 text-red-400 border border-red-800/40"
                            }`}
                          >
                            {item.statusCode === 200 ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {item.statusCode}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#f4efe6] font-medium">{item.latencyMs}ms</td>
                        <td className="p-3.5 text-[#8e93a6]">{item.tokens}</td>
                        <td className="p-3.5 font-mono font-bold text-right text-[#dfba82]">
                          ${item.costUsd.toFixed(5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
