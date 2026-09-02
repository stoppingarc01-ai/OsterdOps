"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  Download,
  Filter,
  Key,
  Layers,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  User,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface CustomerDetail {
  id: string;
  name: string;
  contact: string;
  billingEmail: string;
  tier: "Growth" | "Scale" | "Enterprise";
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
  mrr: string;
  usage: string;
  joined: string;
  apiKeysCount: number;
  projectsCount: number;
  topModel: string;
}

export function AdminCustomersView() {
  const { currentOrg, userOrganizations, user, getIdToken } = useAuth();
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      const orgList = userOrganizations.length > 0 ? userOrganizations : currentOrg ? [currentOrg] : [];
      if (orgList.length === 0) {
        setCustomers([]);
        return;
      }
      setLoading(true);

      try {
        const token = await getIdToken();
        const mapped: CustomerDetail[] = await Promise.all(
          orgList.map(async (o) => {
            let spend = "$0.00";
            let topModel = "—";
            let tokensStr = "0 tokens";
            let projCount = 0;

            try {
              const [analyticsRes, projRes] = await Promise.all([
                apiRequest<any>("/api/v1/analytics/overview", { params: { organizationId: o.id, timeRange: "30d" }, token }),
                apiRequest<any[]>("/api/v1/projects", { params: { organizationId: o.id }, token }),
              ]);
              if (analyticsRes.data?.kpis?.totalSpendUsd != null) {
                spend = `$${analyticsRes.data.kpis.totalSpendUsd.toFixed(2)}`;
              }
              if (Array.isArray(analyticsRes.data?.byModel) && analyticsRes.data.byModel.length > 0) {
                topModel = analyticsRes.data.byModel[0].model;
              }
              if (analyticsRes.data?.kpis?.totalTokens != null) {
                const t = analyticsRes.data.kpis.totalTokens;
                tokensStr = t >= 1_000_000 ? `${(t / 1_000_000).toFixed(1)}M tokens` : `${t.toLocaleString()} tokens`;
              }
              if (Array.isArray(projRes.data)) {
                projCount = projRes.data.length;
              }
            } catch (e) {
              // ignore
            }

            return {
              id: o.id,
              name: o.name || "Customer Workspace",
              contact: user?.email || "customer@tenant.io",
              billingEmail: user?.email || "finance@tenant.io",
              tier: (o.planTier === "enterprise" ? "Enterprise" : o.planTier === "scale" ? "Scale" : "Growth") as any,
              status: "ACTIVE",
              mrr: spend,
              usage: tokensStr,
              joined: "Recent",
              apiKeysCount: 1,
              projectsCount: projCount,
              topModel,
            };
          })
        );

        if (isMounted) {
          setCustomers(mapped);
        }
      } catch (err) {
        if (isMounted) setCustomers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [currentOrg, userOrganizations, user, getIdToken]);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.billingEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "All Tiers" || c.tier === tierFilter;
    const matchesStatus = statusFilter === "All Statuses" || c.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f4efe6] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#dfba82]" />
            Customer Organizations
          </h2>
          <p className="text-xs text-[#8e94a8] mt-1">
            Enterprise tenants and registered organizations.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 bg-[#131722] border border-[#22283a] focus-within:border-[#dfba82] rounded-xl px-3 py-1.5 w-72 transition-colors">
            <Search className="h-3.5 w-3.5 text-[#6c7285]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or email..."
              className="bg-transparent text-[12px] text-white focus:outline-none w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4]">
              <Filter className="h-3.5 w-3.5 text-[#717688] mr-1.5" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent text-[#c5c8d4] focus:outline-none cursor-pointer"
              >
                <option value="All Tiers" className="bg-[#131722]">All Tiers</option>
                <option value="Growth" className="bg-[#131722]">Growth</option>
                <option value="Scale" className="bg-[#131722]">Scale</option>
                <option value="Enterprise" className="bg-[#131722]">Enterprise</option>
              </select>
            </div>

            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customers, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "customers.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 bg-[#131722] hover:bg-[#1b2130] border border-[#22283a] hover:border-[#dfba82]/40 text-[#c5c8d4] hover:text-[#dfba82] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading customer accounts...</div>
            </div>
          ) : (
            <table className="w-full text-left text-[12.5px]">
              <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
                <tr>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Contact Email</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Monthly Spend</th>
                  <th className="pb-3">Tokens (30d)</th>
                  <th className="pb-3">Top Model</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No customer organizations found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="py-4 font-bold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#dfba82]" />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-4 text-[#8e94a8]">{c.contact}</td>
                      <td className="py-4 text-white">{c.tier}</td>
                      <td className="py-4">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-[#dfba82] font-semibold">{c.mrr}</td>
                      <td className="py-4 font-mono text-[#f4efe6]">{c.usage}</td>
                      <td className="py-4 font-mono text-[#8e94a8]">{c.topModel}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
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
          )}
        </div>
      </div>

      {/* Customer Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#171b26]">
                <div>
                  <h2 className="text-base font-bold text-[#f4efe6] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#dfba82]" />
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-xs text-[#717688] font-mono mt-0.5">ID: {selectedCustomer.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-[#717688] hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Primary Contact</span>
                  <span className="text-[#f4efe6]">{selectedCustomer.contact}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Billing Email</span>
                  <span className="text-[#f4efe6]">{selectedCustomer.billingEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Monthly Spend</span>
                  <span className="text-[#dfba82] font-bold font-mono">{selectedCustomer.mrr}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Total Tokens (30d)</span>
                  <span className="text-[#f4efe6] font-mono">{selectedCustomer.usage}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#171b26]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2 bg-[#141824] hover:bg-[#1c2233] text-white text-xs font-semibold rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
