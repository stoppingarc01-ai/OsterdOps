"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Timer, Zap, BarChart2, ShieldCheck } from "lucide-react";

export default function LatencyPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Timer className="w-3.5 h-3.5" />
                  Performance SLA
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Latency & Response Benchmarks
                </h1>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">P50 (Median)</div>
                <div className="text-2xl font-bold text-[#f4efe6]">310ms</div>
                <div className="text-[11px] text-emerald-400 mt-2">Optimal user interaction threshold</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">P95 (Tail)</div>
                <div className="text-2xl font-bold text-[#f4efe6]">920ms</div>
                <div className="text-[11px] text-[#8e93a6] mt-2">95% of calls complete under 1.0s</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">P99 (Outliers)</div>
                <div className="text-2xl font-bold text-[#f4efe6]">1,450ms</div>
                <div className="text-[11px] text-amber-400 mt-2">Complex reasoning tasks</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                <div className="text-xs font-semibold text-[#8e93a6] mb-1">Gateway Overhead</div>
                <div className="text-2xl font-bold text-[#dfba82]">&lt; 3.2ms</div>
                <div className="text-[11px] text-[#8e93a6] mt-2">Ultra-low proxy transit time</div>
              </div>
            </div>

            {/* Provider Latency Comparison Table */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="text-sm font-semibold text-[#f4efe6]">Provider Latency Percentiles (ms)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3 font-semibold">Provider</th>
                      <th className="p-3 font-semibold">P50</th>
                      <th className="p-3 font-semibold">P90</th>
                      <th className="p-3 font-semibold">P95</th>
                      <th className="p-3 font-semibold">P99</th>
                      <th className="p-3 font-semibold">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">OpenAI</td>
                      <td className="p-3 text-[#f4efe6]">280ms</td>
                      <td className="p-3 text-[#f4efe6]">610ms</td>
                      <td className="p-3 text-[#f4efe6]">850ms</td>
                      <td className="p-3 text-[#f4efe6]">1,320ms</td>
                      <td className="p-3 font-bold text-[#dfba82]">440ms</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">Anthropic</td>
                      <td className="p-3 text-[#f4efe6]">390ms</td>
                      <td className="p-3 text-[#f4efe6]">740ms</td>
                      <td className="p-3 text-[#f4efe6]">990ms</td>
                      <td className="p-3 text-[#f4efe6]">1,580ms</td>
                      <td className="p-3 font-bold text-[#dfba82]">510ms</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">Google Gemini</td>
                      <td className="p-3 text-[#f4efe6]">240ms</td>
                      <td className="p-3 text-[#f4efe6]">520ms</td>
                      <td className="p-3 text-[#f4efe6]">760ms</td>
                      <td className="p-3 text-[#f4efe6]">1,180ms</td>
                      <td className="p-3 font-bold text-[#dfba82]">380ms</td>
                    </tr>
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
