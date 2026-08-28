"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  organization: string;
  plan: string;
  status: "ACTIVE" | "TRIAL" | "INACTIVE";
  mrr: string;
  joined: string;
}

const CUSTOMERS_DATA: CustomerRecord[] = [
  {
    id: "cust_1",
    name: "Acme Inc.",
    organization: "Acme Inc.",
    plan: "Growth",
    status: "ACTIVE",
    mrr: "$49",
    joined: "May 15, 2025",
  },
  {
    id: "cust_2",
    name: "Nova Labs",
    organization: "Nova Labs",
    plan: "Scale",
    status: "ACTIVE",
    mrr: "$199",
    joined: "May 14, 2025",
  },
  {
    id: "cust_3",
    name: "Vertex Systems",
    organization: "Vertex Systems",
    plan: "Enterprise",
    status: "ACTIVE",
    mrr: "Custom",
    joined: "May 10, 2025",
  },
  {
    id: "cust_4",
    name: "Orion Labs",
    organization: "Orion Labs",
    plan: "Growth",
    status: "TRIAL",
    mrr: "$49",
    joined: "May 09, 2025",
  },
];

export function AdminCustomersTableCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = CUSTOMERS_DATA.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === "All Plans" || cust.plan === selectedPlan;
    const matchesStatus =
      selectedStatus === "All Statuses" || cust.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans shadow-sm">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[13px] font-bold tracking-[0.12em] text-[#e8e4dc] uppercase">
            Recent Customers
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 w-48 sm:w-56 focus-within:border-[#dfba82] transition-colors">
            <Search className="h-3.5 w-3.5 text-[#6c7285] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="bg-transparent text-[12px] text-white placeholder-[#6c7285] focus:outline-none w-full"
            />
          </div>

          {/* All Plans Dropdown */}
          <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4] hover:border-[#353e56] transition-colors cursor-pointer group">
            <span>{selectedPlan}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 text-[#717688] group-hover:text-white" />
          </div>

          {/* All Statuses Dropdown */}
          <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4] hover:border-[#353e56] transition-colors cursor-pointer group">
            <span>{selectedStatus}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 text-[#717688] group-hover:text-white" />
          </div>

          {/* Export Button */}
          <button
            onClick={() => alert("Exporting customer dataset...")}
            className="flex items-center gap-1.5 bg-[#131722] hover:bg-[#1b2130] border border-[#22283a] hover:border-[#dfba82]/40 text-[#c5c8d4] hover:text-[#dfba82] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
            <tr>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Organization</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">MRR</th>
              <th className="pb-3 font-medium">Joined</th>
              <th className="pb-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
            {filteredCustomers.map((cust) => (
              <tr
                key={cust.id}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <td className="py-3.5 font-semibold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors">
                  {cust.name}
                </td>
                <td className="py-3.5 text-[#8e94a8]">{cust.organization}</td>
                <td className="py-3.5 text-[#c5c8d4]">{cust.plan}</td>
                <td className="py-3.5">
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      cust.status === "ACTIVE"
                        ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                        : cust.status === "TRIAL"
                        ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {cust.status}
                  </span>
                </td>
                <td className="py-3.5 font-mono text-[#f4efe6] font-medium">
                  {cust.mrr}
                </td>
                <td className="py-3.5 text-[#717688] text-[11.5px]">
                  {cust.joined}
                </td>
                <td className="py-3.5 text-right">
                  <button
                    aria-label="Customer actions"
                    className="p-1 rounded text-[#555a6d] hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="pt-4 mt-2 border-t border-[#171b26] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#717688]">
        <div>Showing 1 to 4 of 32 results</div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded text-[#717688] hover:text-white disabled:opacity-30 disabled:hover:text-[#717688]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(1)}
            className="h-6 w-6 rounded bg-[#dfba82] text-[#07080c] font-bold text-[11px] flex items-center justify-center"
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className="h-6 w-6 rounded text-[#8e94a8] hover:text-white hover:bg-white/[0.04] text-[11px] flex items-center justify-center transition-colors"
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className="h-6 w-6 rounded text-[#8e94a8] hover:text-white hover:bg-white/[0.04] text-[11px] flex items-center justify-center transition-colors"
          >
            3
          </button>
          <span className="px-1 text-[#555a6d]">...</span>
          <button
            onClick={() => setCurrentPage(8)}
            className="h-6 w-6 rounded text-[#8e94a8] hover:text-white hover:bg-white/[0.04] text-[11px] flex items-center justify-center transition-colors"
          >
            8
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(8, p + 1))}
            className="p-1 rounded text-[#717688] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
