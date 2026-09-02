"use client";

import React, { useState } from "react";
import { Building2, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminCustomersTableCard() {
  const { userOrganizations, currentOrg } = useAuth();
  const [search, setSearch] = useState("");

  const orgs = userOrganizations && userOrganizations.length > 0
    ? userOrganizations
    : currentOrg
    ? [currentOrg]
    : [];

  const filtered = orgs.filter((o) =>
    (o.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Active Customer Organizations</h3>
          <p className="text-xs text-[#717688] mt-0.5">Managed enterprise workspaces.</p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6c7285] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#121622] border border-[#1e2638] rounded-xl text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase font-bold text-[#717688] border-b border-[#171b26] pb-2">
            <tr>
              <th className="pb-3">Organization</th>
              <th className="pb-3">Plan Tier</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151924] text-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                  No customer organizations registered
                </td>
              </tr>
            ) : (
              filtered.map((org) => (
                <tr key={org.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#dfba82]" />
                    <span>{org.name || "Workspace"}</span>
                  </td>
                  <td className="py-3 font-mono text-[#c5c8d4]">
                    {org.planTier ? org.planTier.toUpperCase() : "FREE"}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
