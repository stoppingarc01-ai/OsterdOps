"use client";

import React, { useState } from "react";
import {
  Activity,
  Coins,
  Cpu,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

interface ModelUsage {
  model: string;
  provider: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
}

const MODEL_USAGE_DATA: ModelUsage[] = [
  {
    model: "gpt-4o-mini",
    provider: "openai",
    requests: 94210,
    promptTokens: 18450000,
    completionTokens: 6240000,
    cachedTokens: 4120000,
    totalCostUsd: 642.15,
    avgLatencyMs: 142,
  },
  {
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    requests: 28450,
    promptTokens: 11200000,
    completionTokens: 4100000,
    cachedTokens: 2800000,
    totalCostUsd: 792.8,
    avgLatencyMs: 295,
  },
  {
    model: "gemini-1.5-pro",
    provider: "google",
    requests: 16820,
    promptTokens: 8900000,
    completionTokens: 2150000,
    cachedTokens: 1540000,
    totalCostUsd: 264.4,
    avgLatencyMs: 185,
  },
  {
    model: "gpt-4o",
    provider: "openai",
    requests: 8810,
    promptTokens: 4200000,
    completionTokens: 1320000,
    cachedTokens: 980000,
    totalCostUsd: 142.85,
    avgLatencyMs: 380,
  },
];

export function AdminUsageView() {
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredModels = MODEL_USAGE_DATA.filter((m) => {
    const matchesSearch = m.model.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === "ALL" || m.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Total Requests</span>
            <Activity className="w-4 h-4 text-[#dfba82]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">148,290</div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% from last month
          </div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Total Tokens Processed</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">56.56 M</div>
          <div className="text-[11px] text-[#8e93a6] mt-2">
            42.75M prompt / 13.81M completion
          </div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Prompt Cache Savings</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">$214.50</div>
          <div className="text-[11px] text-[#8e93a6] mt-2">9.44M cached tokens read</div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Gateway Latency (p50 / p99)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">142 / 420 ms</div>
          <div className="text-[11px] text-emerald-400 mt-2">99.99% gateway uptime</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google Gemini</option>
          </select>
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07080c] border-b border-[#171b26] text-[#717688] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Model &amp; Provider</th>
                <th className="p-4">Requests</th>
                <th className="p-4">Prompt Tokens</th>
                <th className="p-4">Completion Tokens</th>
                <th className="p-4">Cache Tokens</th>
                <th className="p-4">Total Cost ($USD)</th>
                <th className="p-4 text-right">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-white">
              {filteredModels.map((item) => (
                <tr key={item.model} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white font-mono">{item.model}</div>
                    <div className="text-[11px] text-[#8e93a6] uppercase">{item.provider}</div>
                  </td>
                  <td className="p-4 font-mono">{item.requests.toLocaleString()}</td>
                  <td className="p-4 font-mono text-[#8e93a6]">
                    {(item.promptTokens / 1000000).toFixed(2)}M
                  </td>
                  <td className="p-4 font-mono text-[#8e93a6]">
                    {(item.completionTokens / 1000000).toFixed(2)}M
                  </td>
                  <td className="p-4 font-mono text-emerald-400">
                    {(item.cachedTokens / 1000000).toFixed(2)}M
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#dfba82]">
                    ${item.totalCostUsd.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-mono text-[#8e93a6]">{item.avgLatencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
