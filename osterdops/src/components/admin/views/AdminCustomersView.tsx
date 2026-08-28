"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  Filter,
  Key,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

interface CustomerDetail {
  id: string;
  name: string;
  contact: string;
  tier: "Growth" | "Scale" | "Enterprise";
  status: "ACTIVE" | "TRIAL" | "INACTIVE";
  mrr: string;
  usage: string;
  joined: string;
  billingEmail: string;
  apiKeysCount: number;
  projectsCount: number;
  topModel: string;
}

const INITIAL_CUSTOMERS: CustomerDetail[] = [
  {
    id: "cust_1",
    name: "Acme Inc.",
    contact: "sarah@acme.com",
    billingEmail: "finance@acme.com",
    tier: "Growth",
    status: "ACTIVE",
    mrr: "$49 / mo",
    usage: "4.2M tokens",
    joined: "May 15, 2025",
    apiKeysCount: 3,
    projectsCount: 4,
    topModel: "gpt-4o-mini",
  },
  {
    id: "cust_2",
    name: "Nova Labs",
    contact: "alex@novalabs.ai",
    billingEmail: "billing@novalabs.ai",
    tier: "Scale",
    status: "ACTIVE",
    mrr: "$199 / mo",
    usage: "18.5M tokens",
    joined: "May 14, 2025",
    apiKeysCount: 8,
    projectsCount: 6,
    topModel: "claude-3-5-sonnet",
  },
  {
    id: "cust_3",
    name: "Vertex Systems",
    contact: "dev@vertex.io",
    billingEmail: "ap@vertex.io",
    tier: "Enterprise",
    status: "ACTIVE",
    mrr: "$2,400 / mo",
    usage: "142M tokens",
    joined: "May 10, 2025",
    apiKeysCount: 24,
    projectsCount: 12,
    topModel: "gpt-4o",
  },
  {
    id: "cust_4",
    name: "Orion Labs",
    contact: "billing@orion.dev",
    billingEmail: "billing@orion.dev",
    tier: "Growth",
    status: "TRIAL",
    mrr: "$49 / mo",
    usage: "890K tokens",
    joined: "May 09, 2025",
    apiKeysCount: 2,
    projectsCount: 2,
    topModel: "gemini-1.5-flash",
  },
  {
    id: "cust_5",
    name: "Aether AI",
    contact: "ops@aether.ai",
    billingEmail: "finance@aether.ai",
    tier: "Scale",
    status: "ACTIVE",
    mrr: "$199 / mo",
    usage: "12.8M tokens",
    joined: "May 02, 2025",
    apiKeysCount: 5,
    projectsCount: 3,
    topModel: "claude-3-5-sonnet",
  },
];

export function AdminCustomersView() {
  const [customers, setCustomers] = useState<CustomerDetail[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTier, setNewTier] = useState<"Growth" | "Scale" | "Enterprise">("Growth");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newCust: CustomerDetail = {
      id: `cust_${Date.now()}`,
      name: newName,
      contact: newEmail,
      billingEmail: newEmail,
      tier: newTier,
      status: "ACTIVE",
      mrr: newTier === "Enterprise" ? "$2,400 / mo" : newTier === "Scale" ? "$199 / mo" : "$49 / mo",
      usage: "0 tokens",
      joined: "Just now",
      apiKeysCount: 1,
      projectsCount: 1,
      topModel: "gpt-4o-mini",
    };

    setCustomers([newCust, ...customers]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "All Tiers" || c.tier === tierFilter;
    const matchesStatus = statusFilter === "All Statuses" || c.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">Customer Accounts</h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Manage enterprise and growth customer accounts, spend allowances, and seat allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer KPI mini summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10.5px] uppercase font-bold text-[#717688] tracking-wider">Total Active Accounts</div>
            <div className="text-[20px] font-bold text-white mt-0.5">{customers.length + 2476}</div>
          </div>
        </div>

        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e] flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10.5px] uppercase font-bold text-[#717688] tracking-wider">Paying Subscriptions</div>
            <div className="text-[20px] font-bold text-white mt-0.5">847</div>
          </div>
        </div>

        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 text-[#38bdf8] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10.5px] uppercase font-bold text-[#717688] tracking-wider">Enterprise Contracts</div>
            <div className="text-[20px] font-bold text-white mt-0.5">42</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
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
            {/* Tier Filter */}
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

            {/* Status Filter */}
            <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[#c5c8d4] focus:outline-none cursor-pointer"
              >
                <option value="All Statuses" className="bg-[#131722]">All Statuses</option>
                <option value="ACTIVE" className="bg-[#131722]">Active</option>
                <option value="TRIAL" className="bg-[#131722]">Trial</option>
              </select>
            </div>

            <button
              onClick={() => alert("Exporting customer list to CSV...")}
              className="flex items-center gap-1.5 bg-[#131722] hover:bg-[#1b2130] border border-[#22283a] hover:border-[#dfba82]/40 text-[#c5c8d4] hover:text-[#dfba82] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <td className="py-4 font-bold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors">
                    {c.name}
                  </td>
                  <td className="py-4 text-[#8e94a8]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-[#555a6d]" />
                      <span>{c.contact}</span>
                    </span>
                  </td>
                  <td className="py-4 text-white font-medium">{c.tier}</td>
                  <td className="py-4">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        c.status === "ACTIVE"
                          ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                          : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-[#dfba82] font-semibold">{c.mrr}</td>
                  <td className="py-4 font-mono text-[#38bdf8]">{c.usage}</td>
                  <td className="py-4 font-mono text-[11.5px] text-[#a5adc2]">{c.topModel}</td>
                  <td className="py-4 text-[#717688] text-[11.5px]">{c.joined}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slideover Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2232]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center font-bold text-[14px]">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white">{selectedCustomer.name}</h3>
                    <span className="text-[11px] text-[#717688] font-mono">{selectedCustomer.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Account Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121622] border border-[#1e2536] p-3 rounded-xl">
                  <div className="text-[10.5px] uppercase font-semibold text-[#717688]">Monthly MRR</div>
                  <div className="text-[16px] font-bold text-[#dfba82] font-mono mt-0.5">
                    {selectedCustomer.mrr}
                  </div>
                </div>

                <div className="bg-[#121622] border border-[#1e2536] p-3 rounded-xl">
                  <div className="text-[10.5px] uppercase font-semibold text-[#717688]">Token Usage</div>
                  <div className="text-[16px] font-bold text-[#38bdf8] font-mono mt-0.5">
                    {selectedCustomer.usage}
                  </div>
                </div>
              </div>

              {/* Account Details Details */}
              <div className="space-y-3 text-[12.5px]">
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Plan Tier:</span>
                  <span className="font-semibold text-white">{selectedCustomer.tier}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Account Status:</span>
                  <span className="font-semibold text-[#22c55e]">{selectedCustomer.status}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Primary Admin:</span>
                  <span className="font-mono text-white">{selectedCustomer.contact}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Billing Email:</span>
                  <span className="font-mono text-[#a5adc2]">{selectedCustomer.billingEmail}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Active API Keys:</span>
                  <span className="font-mono text-white">{selectedCustomer.apiKeysCount} keys</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Projects:</span>
                  <span className="font-mono text-white">{selectedCustomer.projectsCount} projects</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#171b26]">
                  <span className="text-[#717688]">Joined Date:</span>
                  <span className="text-white">{selectedCustomer.joined}</span>
                </div>
              </div>
            </div>

            {/* Actions Bottom */}
            <div className="pt-4 border-t border-[#1c2232] space-y-2">
              <button
                onClick={() => alert(`Reset API Key limit for ${selectedCustomer.name}`)}
                className="w-full py-2.5 bg-[#161a26] hover:bg-[#1f2536] border border-[#252c40] text-[#f4efe6] rounded-xl text-[12.5px] font-semibold transition-colors"
              >
                Reset Gateway Limits
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] rounded-xl text-[12.5px] font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-[16px]">
                <Plus className="h-4 w-4 text-[#dfba82]" />
                <span>Onboard New Customer</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#6c7285] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Company / Account Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Helix Robotics"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Primary Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. devops@helix.com"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Subscription Tier
                </label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as "Growth" | "Scale" | "Enterprise")}
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                >
                  <option value="Growth">Growth ($49 / mo)</option>
                  <option value="Scale">Scale ($199 / mo)</option>
                  <option value="Enterprise">Enterprise Custom ($2,400 / mo)</option>
                </select>
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
                  Create Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
