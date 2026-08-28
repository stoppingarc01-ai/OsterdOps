"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Plus, TrendingUp, TrendingDown, LineChart, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

interface ModelItem {
  id: string;
  name: string;
  code: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "AWS Bedrock";
  type: "Chat" | "Embedding" | "Image" | "Audio";
  spend: string;
  spendTrend: string;
  isUp: boolean;
  tokens: string;
  avgCost: string;
  requests: string;
  status: "Active" | "Inactive";
}

const INITIAL_MODELS: ModelItem[] = [
  {
    id: "1",
    name: "GPT-4o",
    code: "gpt-4o",
    provider: "OpenAI",
    type: "Chat",
    spend: "$12,450.21",
    spendTrend: "15.6%",
    isUp: true,
    tokens: "89.2M",
    avgCost: "$0.139",
    requests: "24,532",
    status: "Active",
  },
  {
    id: "2",
    name: "Claude 3.5 Sonnet",
    code: "claude-3-5-sonnet",
    provider: "Anthropic",
    type: "Chat",
    spend: "$9,120.43",
    spendTrend: "20.1%",
    isUp: false,
    tokens: "67.8M",
    avgCost: "$0.134",
    requests: "18,921",
    status: "Active",
  },
  {
    id: "3",
    name: "GPT-4o-mini",
    code: "gpt-4o-mini",
    provider: "OpenAI",
    type: "Chat",
    spend: "$6,890.12",
    spendTrend: "11.3%",
    isUp: false,
    tokens: "124.6M",
    avgCost: "$0.055",
    requests: "45,612",
    status: "Active",
  },
  {
    id: "4",
    name: "Gemini 1.5 Pro",
    code: "gemini-1.5-pro",
    provider: "Google",
    type: "Chat",
    spend: "$5,421.32",
    spendTrend: "4.2%",
    isUp: true,
    tokens: "42.3M",
    avgCost: "$0.128",
    requests: "12,432",
    status: "Active",
  },
  {
    id: "5",
    name: "Claude 3 Haiku",
    code: "claude-3-haiku",
    provider: "Anthropic",
    type: "Chat",
    spend: "$2,145.67",
    spendTrend: "18.7%",
    isUp: true,
    tokens: "26.1M",
    avgCost: "$0.082",
    requests: "8,231",
    status: "Active",
  },
  {
    id: "6",
    name: "Text Embedding 3 Large",
    code: "text-embedding-3-large",
    provider: "OpenAI",
    type: "Embedding",
    spend: "$1,204.18",
    spendTrend: "8.9%",
    isUp: false,
    tokens: "320.6M",
    avgCost: "$0.004",
    requests: "96,432",
    status: "Active",
  },
  {
    id: "7",
    name: "Gemini 1.5 Flash",
    code: "gemini-1.5-flash",
    provider: "Google",
    type: "Chat",
    spend: "$864.32",
    spendTrend: "6.4%",
    isUp: true,
    tokens: "18.7M",
    avgCost: "$0.046",
    requests: "5,421",
    status: "Active",
  },
  {
    id: "8",
    name: "DALL·E 3",
    code: "dall-e-3",
    provider: "OpenAI",
    type: "Image",
    spend: "$642.19",
    spendTrend: "12.2%",
    isUp: false,
    tokens: "-",
    avgCost: "-",
    requests: "2,143",
    status: "Active",
  },
  {
    id: "9",
    name: "Whisper Large v3",
    code: "whisper-large-v3",
    provider: "OpenAI",
    type: "Audio",
    spend: "$312.45",
    spendTrend: "9.1%",
    isUp: false,
    tokens: "-",
    avgCost: "-",
    requests: "1,231",
    status: "Active",
  },
  {
    id: "10",
    name: "Llama 3.1 70B",
    code: "llama-3-1-70b",
    provider: "AWS Bedrock",
    type: "Chat",
    spend: "$198.21",
    spendTrend: "14.6%",
    isUp: false,
    tokens: "8.4M",
    avgCost: "$0.123",
    requests: "842",
    status: "Active",
  },
];

import { ModelIconBadge, ProviderIconBadge } from "@/components/ui/ModelLogos";

interface ModelsTableCardProps {
  onOpenAddModel: () => void;
}

export function ModelsTableCard({ onOpenAddModel }: ModelsTableCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("All Providers");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = INITIAL_MODELS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      providerFilter === "All Providers" || m.provider === providerFilter;
    const matchesType = typeFilter === "All Types" || m.type === typeFilter;
    return matchesSearch && matchesProvider && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#787d91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
            />
          </div>

          {/* Provider Filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Providers">All Providers</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Google">Google</option>
              <option value="AWS Bedrock">AWS Bedrock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Types">All Types</option>
              <option value="Chat">Chat</option>
              <option value="Embedding">Embedding</option>
              <option value="Image">Image</option>
              <option value="Audio">Audio</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Add Model Button */}
        <button
          type="button"
          onClick={onOpenAddModel}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Model</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Models ({filtered.length})
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-medium">Model</th>
                <th className="pb-3 font-medium">Provider</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right cursor-pointer hover:text-white">
                  Total Spend ⇅
                </th>
                <th className="pb-3 font-medium text-right">Tokens</th>
                <th className="pb-3 font-medium text-right">Avg. Cost / 1K Tokens</th>
                <th className="pb-3 font-medium text-right">Requests</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151826]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Model Name, Logo & Code */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <ModelIconBadge modelName={item.name} provider={item.provider} size="sm" />
                      <div>
                        <div className="font-semibold text-white tracking-tight">
                          {item.name}
                        </div>
                        <div className="text-[10.5px] text-[#73788c] font-mono">
                          {item.code}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Provider with Official Brand Logo */}
                  <td className="py-3 pr-4">
                    <ProviderIconBadge provider={item.provider} />
                  </td>

                  {/* Type Pill */}
                  <td className="py-3 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#161826] border border-[#25283b] text-[10.5px] text-[#c5c9d6]">
                      {item.type}
                    </span>
                  </td>

                  {/* Total Spend & Trend */}
                  <td className="py-3 pr-4 text-right font-mono">
                    <div className="font-bold text-white">{item.spend}</div>
                    <div
                      className={`text-[10px] flex items-center justify-end gap-0.5 ${
                        item.isUp ? "text-[#dfba82]" : "text-[#4ade80]"
                      }`}
                    >
                      {item.isUp ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      <span>{item.spendTrend}</span>
                    </div>
                  </td>

                  {/* Tokens */}
                  <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                    {item.tokens}
                  </td>

                  {/* Avg Cost */}
                  <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                    {item.avgCost}
                  </td>

                  {/* Requests */}
                  <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                    {item.requests}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#787d91]">
                      <button type="button" className="p-1 hover:text-white transition-colors" title="View Chart">
                        <LineChart className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:text-white transition-colors" title="Options">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#171a27] text-xs text-[#73788c]">
          <div>Showing 1 to 10 of 28 models</div>

          <div className="flex items-center gap-2">
            <button type="button" className="p-1.5 rounded-lg border border-[#232738] hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="w-7 h-7 rounded-lg bg-[#dfba82] text-[#090a0f] font-bold text-xs">
              1
            </button>
            <button type="button" className="w-7 h-7 rounded-lg border border-[#232738] hover:text-white text-xs">
              2
            </button>
            <button type="button" className="w-7 h-7 rounded-lg border border-[#232738] hover:text-white text-xs">
              3
            </button>
            <button type="button" className="p-1.5 rounded-lg border border-[#232738] hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
