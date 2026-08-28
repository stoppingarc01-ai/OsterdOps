"use client";

import React, { useState } from "react";
import {
  Building2,
  DollarSign,
  FolderKanban,
  Key,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

interface OrganizationDetail {
  id: string;
  name: string;
  owner: string;
  projectsCount: number;
  membersCount: number;
  monthlyBudget: string;
  currentSpend: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
  createdDate: string;
  tier: string;
  projects: string[];
}

const INITIAL_ORGS: OrganizationDetail[] = [
  {
    id: "org_acme",
    name: "Acme Enterprises",
    owner: "sarah@acme.com",
    projectsCount: 6,
    membersCount: 14,
    monthlyBudget: "$2,500",
    currentSpend: "$1,842.20",
    status: "ACTIVE",
    createdDate: "Jan 12, 2025",
    tier: "Enterprise",
    projects: ["Production Gateway", "Staging LLM", "RAG Pipeline", "Customer Support Bot"],
  },
  {
    id: "org_nova",
    name: "Nova Labs",
    owner: "alex@novalabs.ai",
    projectsCount: 4,
    membersCount: 8,
    monthlyBudget: "$1,200",
    currentSpend: "$784.50",
    status: "ACTIVE",
    createdDate: "Feb 04, 2025",
    tier: "Scale",
    projects: ["Core API", "Search Engine", "Summarizer Pro"],
  },
  {
    id: "org_vertex",
    name: "Vertex Systems",
    owner: "dev@vertex.io",
    projectsCount: 12,
    membersCount: 38,
    monthlyBudget: "$10,000",
    currentSpend: "$6,920.80",
    status: "ACTIVE",
    createdDate: "Nov 20, 2024",
    tier: "Enterprise",
    projects: ["Autonomous Agents", "Code Assistant", "Data Ingestion", "Analytics Service"],
  },
  {
    id: "org_orion",
    name: "Orion Research",
    owner: "billing@orion.dev",
    projectsCount: 2,
    membersCount: 4,
    monthlyBudget: "$500",
    currentSpend: "$310.15",
    status: "TRIAL",
    createdDate: "Apr 28, 2025",
    tier: "Growth",
    projects: ["Research Sandbox", "Benchmarking"],
  },
];

export function AdminOrganizationsView() {
  const [orgs, setOrgs] = useState<OrganizationDetail[]>(INITIAL_ORGS);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [budget, setBudget] = useState("1000");

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner) return;

    const newOrg: OrganizationDetail = {
      id: `org_${Date.now()}`,
      name,
      owner,
      projectsCount: 1,
      membersCount: 1,
      monthlyBudget: `$${budget}`,
      currentSpend: "$0.00",
      status: "ACTIVE",
      createdDate: "Just now",
      tier: "Scale",
      projects: ["Default Project"],
    };

    setOrgs([newOrg, ...orgs]);
    setIsAddModalOpen(false);
    setName("");
    setOwner("");
  };

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            Organizations &amp; Workspaces
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Multi-tenant organization boundary manager, project quotas, and organization-level budgets.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Organization</span>
        </button>
      </div>

      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 bg-[#131722] border border-[#22283a] focus-within:border-[#dfba82] rounded-xl px-3 py-1.5 w-72 mb-5 transition-colors">
          <Search className="h-3.5 w-3.5 text-[#6c7285]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="bg-transparent text-[12px] text-white focus:outline-none w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Organization</th>
                <th className="pb-3">Primary Owner</th>
                <th className="pb-3">Projects</th>
                <th className="pb-3">Members</th>
                <th className="pb-3">Monthly Cap</th>
                <th className="pb-3">Current Spend</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {filteredOrgs.map((org) => (
                <tr
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <td className="py-4 font-bold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#dfba82]" />
                    <span>{org.name}</span>
                  </td>
                  <td className="py-4 text-[#8e94a8]">{org.owner}</td>
                  <td className="py-4 font-mono text-[#f4efe6]">{org.projectsCount} projects</td>
                  <td className="py-4 font-mono text-[#f4efe6]">{org.membersCount} seats</td>
                  <td className="py-4 font-mono text-[#717688]">{org.monthlyBudget}</td>
                  <td className="py-4 font-mono text-[#dfba82] font-semibold">{org.currentSpend}</td>
                  <td className="py-4 text-white">{org.tier}</td>
                  <td className="py-4">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                      {org.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrg(org);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#555a6d] hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Slideover Drawer */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2232]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white">{selectedOrg.name}</h3>
                    <span className="text-[11px] text-[#717688] font-mono">{selectedOrg.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Spend & Limits Card */}
              <div className="bg-[#121622] border border-[#1e2536] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#717688]">Monthly Budget Cap:</span>
                  <span className="font-bold text-white font-mono">{selectedOrg.monthlyBudget}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#717688]">Current Month Spend:</span>
                  <span className="font-bold text-[#dfba82] font-mono">{selectedOrg.currentSpend}</span>
                </div>
              </div>

              {/* Active Projects in Org */}
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#717688] mb-2">
                  Active Projects ({selectedOrg.projects.length})
                </div>
                <div className="space-y-1.5">
                  {selectedOrg.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#121520] border border-[#1b202e] rounded-xl flex items-center justify-between text-[12.5px] text-white"
                    >
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-3.5 w-3.5 text-[#dfba82]" />
                        <span>{proj}</span>
                      </div>
                      <span className="text-[10px] text-[#22c55e] font-mono font-bold">HEALTHY</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1c2232]">
              <button
                onClick={() => setSelectedOrg(null)}
                className="w-full py-2.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] rounded-xl text-[12.5px] font-bold transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Organization Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-[16px]">
                <Building2 className="h-4 w-4 text-[#dfba82]" />
                <span>Create New Organization</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#6c7285] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Primary Owner / Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. admin@acme.com"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Monthly Hard Budget ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1c2232]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[12.5px] text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-md"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
