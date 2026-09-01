"use client";

import React, { useState } from "react";
import {
  Activity,
  Gauge,
  Clock,
  Coins,
  ShieldCheck,
  TrendingUp,
  Zap,
  Layers,
  AlertTriangle,
  Info,
  Server,
  ArrowUpRight,
} from "lucide-react";

export function DeveloperUsageView() {
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="space-y-6">
      {/* Top Rate Limit & Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rate Limit Allowance */}
        <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Rate Limit</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">1,200 RPM</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span>98.4% capacity remaining</span>
            </p>
          </div>
          <div className="w-full bg-[#161928] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[1.6%]" />
          </div>
        </div>

        {/* Card 2: Current Window Remaining */}
        <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Window Remaining</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">1,182 Req</div>
            <p className="text-xs text-[#8e93a6]">Resets in 42 seconds</p>
          </div>
          <div className="text-[11px] font-mono text-[#73788c]">
            Header: <span className="text-blue-400">x-ratelimit-remaining</span>
          </div>
        </div>

        {/* Card 3: Monthly Spend vs Budget */}
        <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Spend vs Hard Ceiling</span>
            <Coins className="w-4 h-4 text-[#dfba82]" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">$18.42</div>
            <p className="text-xs text-[#8e93a6]">of $250.00 Monthly Limit (7.3%)</p>
          </div>
          <div className="w-full bg-[#161928] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#dfba82] h-full rounded-full w-[7.3%]" />
          </div>
        </div>

        {/* Card 4: Prompt Cache Savings */}
        <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Prompt Cache Savings</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">$4.89</div>
            <p className="text-xs text-purple-400">42.1% Cache Hit Rate</p>
          </div>
          <div className="text-[11px] font-mono text-[#73788c]">
            Saved <span className="text-purple-400">1.28M cached tokens</span>
          </div>
        </div>
      </div>

      {/* Provider Quota & Distribution Table */}
      <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b1e2c]">
          <div>
            <h2 className="text-base font-bold text-white font-serif">AI Provider Quotas & Usage Breakdown</h2>
            <p className="text-xs text-[#8e93a6] mt-0.5">
              Live token volume, request concurrency, and throughput quotas per connected upstream vendor.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111422] border border-[#1b1e2c]">
            {(["24h", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedPeriod === p ? "bg-[#1b1e2c] text-white" : "text-[#73788c] hover:text-white"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b1e2c] text-[#8e93a6]">
                <th className="pb-3 font-semibold">Provider</th>
                <th className="pb-3 font-semibold">Total Requests</th>
                <th className="pb-3 font-semibold">Input Tokens</th>
                <th className="pb-3 font-semibold">Output Tokens</th>
                <th className="pb-3 font-semibold">Cached Tokens</th>
                <th className="pb-3 font-semibold">Estimated Cost</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161928] font-mono">
              <tr className="hover:bg-[#111422]/50 transition-colors">
                <td className="py-3.5 font-bold text-white font-sans flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>OpenAI</span>
                </td>
                <td className="py-3.5 text-white">4,281</td>
                <td className="py-3.5 text-[#8e93a6]">1,420,500</td>
                <td className="py-3.5 text-[#8e93a6]">384,100</td>
                <td className="py-3.5 text-purple-400">512,000</td>
                <td className="py-3.5 text-[#dfba82] font-bold">$9.42</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-sans font-semibold border border-emerald-800/30">
                    Normal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#111422]/50 transition-colors">
                <td className="py-3.5 font-bold text-white font-sans flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Anthropic</span>
                </td>
                <td className="py-3.5 text-white">2,140</td>
                <td className="py-3.5 text-[#8e93a6]">980,200</td>
                <td className="py-3.5 text-[#8e93a6]">245,600</td>
                <td className="py-3.5 text-purple-400">410,000</td>
                <td className="py-3.5 text-[#dfba82] font-bold">$7.15</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-sans font-semibold border border-emerald-800/30">
                    Normal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#111422]/50 transition-colors">
                <td className="py-3.5 font-bold text-white font-sans flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Google Gemini</span>
                </td>
                <td className="py-3.5 text-white">1,820</td>
                <td className="py-3.5 text-[#8e93a6]">820,000</td>
                <td className="py-3.5 text-[#8e93a6]">180,400</td>
                <td className="py-3.5 text-purple-400">358,000</td>
                <td className="py-3.5 text-[#dfba82] font-bold">$1.85</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-sans font-semibold border border-emerald-800/30">
                    Normal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limit Architecture & Response Headers Guide */}
      <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#dfba82]" />
          <h2 className="text-sm font-bold text-white font-serif">Gateway Rate Limit Headers Reference</h2>
        </div>
        <p className="text-xs text-[#8e93a6] leading-relaxed">
          Every HTTP response from the OsterdOps AI Gateway includes standard RFC rate limiting headers so your client
          applications can gracefully pace requests before hitting rate limits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
            <div className="font-mono text-xs text-[#dfba82]">x-ratelimit-limit</div>
            <div className="text-xs text-white">Maximum allowed requests in current 60s sliding window.</div>
            <div className="text-[10px] text-[#73788c] font-mono">Example: 1200</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
            <div className="font-mono text-xs text-emerald-400">x-ratelimit-remaining</div>
            <div className="text-xs text-white">Remaining requests before rate limiting kicks in.</div>
            <div className="text-[10px] text-[#73788c] font-mono">Example: 1182</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1b1e2c] space-y-1">
            <div className="font-mono text-xs text-blue-400">x-ratelimit-reset</div>
            <div className="text-xs text-white">Unix epoch timestamp (seconds) when quota refreshes.</div>
            <div className="text-[10px] text-[#73788c] font-mono">Example: 1788194000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
