"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Plus, MoreVertical, Key, ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  team: string;
  role: string;
  roleBadgeColor: string;
  spend: string;
  tokens: string;
  keys: string;
  status: "Active" | "Pending";
}

const MEMBERS_DATA: Member[] = [
  {
    id: "1",
    name: "Shaan Prasad",
    email: "shaan@acmecorp.com",
    initials: "SP",
    team: "AI Core",
    role: "Admin",
    roleBadgeColor: "bg-[#dfba82]/15 text-[#dfba82] border-[#dfba82]/30",
    spend: "$12,450.21",
    tokens: "89.2M",
    keys: "12 Keys",
    status: "Active",
  },
  {
    id: "2",
    name: "Elena Rostova",
    email: "elena.r@acmecorp.com",
    initials: "ER",
    team: "ML Ops",
    role: "Lead Engineer",
    roleBadgeColor: "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30",
    spend: "$9,120.43",
    tokens: "67.8M",
    keys: "8 Keys",
    status: "Active",
  },
  {
    id: "3",
    name: "Marcus Chen",
    email: "marcus.c@acmecorp.com",
    initials: "MC",
    team: "Product AI",
    role: "Senior Developer",
    roleBadgeColor: "bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30",
    spend: "$6,890.12",
    tokens: "45.6M",
    keys: "5 Keys",
    status: "Active",
  },
  {
    id: "4",
    name: "Aisha Patel",
    email: "aisha.p@acmecorp.com",
    initials: "AP",
    team: "Data Platform",
    role: "Developer",
    roleBadgeColor: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
    spend: "$5,421.32",
    tokens: "42.3M",
    keys: "4 Keys",
    status: "Active",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david.k@acmecorp.com",
    initials: "DK",
    team: "Growth AI",
    role: "Developer",
    roleBadgeColor: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
    spend: "$3,210.50",
    tokens: "28.4M",
    keys: "3 Keys",
    status: "Active",
  },
  {
    id: "6",
    name: "Sarah Jenkins",
    email: "sarah.j@acmecorp.com",
    initials: "SJ",
    team: "Research Lab",
    role: "Research Scientist",
    roleBadgeColor: "bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30",
    spend: "$2,840.15",
    tokens: "19.7M",
    keys: "6 Keys",
    status: "Active",
  },
  {
    id: "7",
    name: "Lucas Vance",
    email: "lucas.v@acmecorp.com",
    initials: "LV",
    team: "AI Core",
    role: "Developer",
    roleBadgeColor: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
    spend: "$1,450.00",
    tokens: "12.1M",
    keys: "2 Keys",
    status: "Active",
  },
  {
    id: "8",
    name: "Maya Lin",
    email: "maya.l@acmecorp.com",
    initials: "ML",
    team: "Product AI",
    role: "Developer",
    roleBadgeColor: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
    spend: "$945.91",
    tokens: "7.2M",
    keys: "1 Key",
    status: "Pending",
  },
];

interface TeamsTableCardProps {
  onOpenInvite: () => void;
}

export function TeamsTableCard({ onOpenInvite }: TeamsTableCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filtered = MEMBERS_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === "All Teams" || m.team === teamFilter;
    const matchesRole = roleFilter === "All Roles" || m.role === roleFilter;
    const matchesStatus = statusFilter === "All Status" || m.status === statusFilter;
    return matchesSearch && matchesTeam && matchesRole && matchesStatus;
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
              placeholder="Search members or teams..."
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
            />
          </div>

          {/* Team Filter */}
          <div className="relative">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Teams">All Teams</option>
              <option value="AI Core">AI Core</option>
              <option value="ML Ops">ML Ops</option>
              <option value="Product AI">Product AI</option>
              <option value="Data Platform">Data Platform</option>
              <option value="Growth AI">Growth AI</option>
              <option value="Research Lab">Research Lab</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Roles">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Lead Engineer">Lead Engineer</option>
              <option value="Senior Developer">Senior Developer</option>
              <option value="Developer">Developer</option>
              <option value="Research Scientist">Research Scientist</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Add Developer Button */}
        <button
          type="button"
          onClick={onOpenInvite}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Developer</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Developers & Team Members ({filtered.length})
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-medium">Developer / Member</th>
                <th className="pb-3 font-medium">Team</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium text-right cursor-pointer hover:text-white">
                  Monthly Spend ⇅
                </th>
                <th className="pb-3 font-medium text-right">Tokens Used</th>
                <th className="pb-3 font-medium text-right">Active Keys</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151826]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Developer Name & Email */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#141724] border border-[#232738] text-[#dfba82] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-white tracking-tight">
                          {item.name}
                        </div>
                        <div className="text-[10.5px] text-[#73788c] font-mono">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 pr-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#1f2335] text-[#c5c9d6] font-medium text-[11px]">
                      {item.team}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${item.roleBadgeColor}`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* Monthly Spend */}
                  <td className="py-3.5 pr-4 text-right font-mono font-bold text-white">
                    {item.spend}
                  </td>

                  {/* Tokens Used */}
                  <td className="py-3.5 pr-4 text-right font-mono text-[#c5c9d6]">
                    {item.tokens}
                  </td>

                  {/* Active Keys */}
                  <td className="py-3.5 pr-4 text-right font-mono text-[#c5c9d6]">
                    <div className="inline-flex items-center gap-1">
                      <Key className="w-3 h-3 text-[#dfba82]" />
                      <span>{item.keys}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        item.status === "Active" ? "text-[#4ade80]" : "text-[#f59e0b]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Active" ? "bg-[#4ade80]" : "bg-[#f59e0b]"
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-center">
                    <button
                      type="button"
                      className="p-1 text-[#787d91] hover:text-white transition-colors"
                      title="Manage User"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#171a27] text-xs text-[#73788c]">
          <div>Showing 1 to 8 of 42 developers</div>

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
