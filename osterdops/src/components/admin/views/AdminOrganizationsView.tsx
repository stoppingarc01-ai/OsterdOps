"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  FolderKanban,
  Search,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Coins,
  X,
  Check,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

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

export function AdminOrganizationsView() {
  const { currentOrg, userOrganizations, user, getIdToken } = useAuth();
  const [orgs, setOrgs] = useState<OrganizationDetail[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [budget, setBudget] = useState("1000");
  const [tier, setTier] = useState("Growth");

  useEffect(() => {
    let isMounted = true;

    async function loadOrgs() {
      const orgList = userOrganizations.length > 0 ? userOrganizations : currentOrg ? [currentOrg] : [];
      if (orgList.length === 0) {
        setOrgs([]);
        return;
      }

      try {
        const token = await getIdToken();
        const mapped: OrganizationDetail[] = await Promise.all(
          orgList.map(async (o) => {
            let projects: string[] = [];
            let spend = "$0.00";

            try {
              const [projRes, analyticsRes] = await Promise.all([
                apiRequest<any[]>("/api/v1/projects", { params: { organizationId: o.id }, token }),
                apiRequest<any>("/api/v1/analytics/overview", { params: { organizationId: o.id, timeRange: "30d" }, token }),
              ]);
              if (Array.isArray(projRes.data)) {
                projects = projRes.data.map((p) => p.name);
              }
              if (analyticsRes.data?.kpis?.totalSpendUsd != null) {
                spend = `$${analyticsRes.data.kpis.totalSpendUsd.toFixed(2)}`;
              }
            } catch (e) {
              // ignore
            }

            return {
              id: o.id,
              name: o.name || "Workspace",
              owner: user?.email || "owner@tenant.io",
              projectsCount: projects.length,
              membersCount: 1,
              monthlyBudget: "$1,000",
              currentSpend: spend,
              status: "ACTIVE",
              createdDate: "Recent",
              tier: o.planTier ? `${o.planTier.toUpperCase()}` : "STARTER",
              projects,
            };
          })
        );

        if (isMounted) {
          setOrgs(mapped);
        }
      } catch (err) {
        if (isMounted) setOrgs([]);
      }
    }

    loadOrgs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg, userOrganizations, user, getIdToken]);

  const filteredOrgs = orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.owner.toLowerCase().includes(search.toLowerCase()) ||
      org.tier.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newOrg: OrganizationDetail = {
      id: `org_${Date.now()}`,
      name,
      owner: owner || "admin@workspace.com",
      projectsCount: 1,
      membersCount: 1,
      monthlyBudget: `$${Number(budget).toLocaleString()}`,
      currentSpend: "$0.00",
      status: "ACTIVE",
      createdDate: "Just now",
      tier,
      projects: ["Default Project"],
    };

    setOrgs([newOrg, ...orgs]);
    setName("");
    setOwner("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-[#555a6d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations or owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0f16] border border-[#171b26] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Organizations Table Card */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 shadow-sm overflow-hidden">
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
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
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
                ))
              )}
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
              <div className="flex items-center justify-between pb-4 border-b border-[#171b26]">
                <div>
                  <h2 className="text-base font-bold text-[#f4efe6] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#dfba82]" />
                    {selectedOrg.name}
                  </h2>
                  <p className="text-xs text-[#717688] font-mono mt-0.5">ID: {selectedOrg.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="p-1 text-[#717688] hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#07080c] border border-[#171b26] rounded-xl">
                  <span className="text-[10.5px] uppercase font-bold text-[#555a6d]">Subscription</span>
                  <div className="text-sm font-bold text-white mt-1">{selectedOrg.tier} Tier</div>
                </div>
                <div className="p-3 bg-[#07080c] border border-[#171b26] rounded-xl">
                  <span className="text-[10.5px] uppercase font-bold text-[#555a6d]">Current Spend</span>
                  <div className="text-sm font-bold text-[#dfba82] font-mono mt-1">
                    {selectedOrg.currentSpend}
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#717688]">
                  Active Workspaces ({selectedOrg.projects.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedOrg.projects.map((p) => (
                    <div
                      key={p}
                      className="p-2.5 bg-[#07080c] border border-[#171b26] rounded-lg text-xs font-semibold text-[#f4efe6] flex items-center justify-between"
                    >
                      <span>{p}</span>
                      <FolderKanban className="h-3.5 w-3.5 text-[#dfba82]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#171b26] flex gap-2">
              <button
                onClick={() => setSelectedOrg(null)}
                className="w-full py-2.5 bg-[#141824] hover:bg-[#1c2233] text-white text-xs font-semibold rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Organization Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-[#f4efe6]">Provision New Organization</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#717688] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Helix AI Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. lead@helix.ai"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Subscription Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd4aa]"
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
