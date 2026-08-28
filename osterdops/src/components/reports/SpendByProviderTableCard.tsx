"use client";

import React from "react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { ProviderIconBadge } from "@/components/ui/ModelLogos";

export function SpendByProviderTableCard() {
  const providers = [
    {
      name: "OpenAI",
      spend: "$19,932.43",
      pct: "47.1%",
      requests: "562,431",
      tokens: "234.8M",
      avgCost: "$0.085",
      trend: "16.3%",
      isUp: true,
    },
    {
      name: "Anthropic",
      spend: "$11,265.97",
      pct: "26.6%",
      requests: "312,874",
      tokens: "128.6M",
      avgCost: "$0.088",
      trend: "9.7%",
      isUp: true,
    },
    {
      name: "Google",
      spend: "$7,578.64",
      pct: "17.9%",
      requests: "198,431",
      tokens: "98.2M",
      avgCost: "$0.077",
      trend: "21.2%",
      isUp: true,
    },
    {
      name: "AWS Bedrock",
      spend: "$2,145.67",
      pct: "5.1%",
      requests: "74,231",
      tokens: "35.4M",
      avgCost: "$0.061",
      trend: "3.4%",
      isUp: false,
    },
    {
      name: "Others",
      spend: "$1,405.93",
      pct: "3.3%",
      requests: "53,241",
      tokens: "22.1M",
      avgCost: "$0.064",
      trend: "1.8%",
      isUp: false,
    },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Provider</h3>
        <p className="text-xs text-[#8e93a6] mt-0.5">Detailed breakdown of costs by provider</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-medium">Provider</th>
              <th className="pb-3 font-medium text-right">Total Spend</th>
              <th className="pb-3 font-medium text-right">% of Total</th>
              <th className="pb-3 font-medium text-right">Requests</th>
              <th className="pb-3 font-medium text-right">Tokens</th>
              <th className="pb-3 font-medium text-right">Avg. Cost / 1K Tokens</th>
              <th className="pb-3 font-medium text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151826]">
            {providers.map((item) => (
              <tr key={item.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <ProviderIconBadge provider={item.name} />
                </td>
                <td className="py-3 pr-4 text-right font-mono font-bold text-white">
                  {item.spend}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                  {item.pct}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                  {item.requests}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                  {item.tokens}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                  {item.avgCost}
                </td>
                <td className="py-3 text-right font-mono">
                  <span
                    className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${
                      item.isUp ? "text-[#4ade80]" : "text-[#ef4444]"
                    }`}
                  >
                    {item.isUp ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{item.trend}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-[#171a27]">
        <button
          type="button"
          className="px-3.5 py-1.5 rounded-xl border border-[#232738] bg-[#121422] hover:bg-[#1a1d2e] text-[#c5c9d6] hover:text-[#dfba82] text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>View Full Provider Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
