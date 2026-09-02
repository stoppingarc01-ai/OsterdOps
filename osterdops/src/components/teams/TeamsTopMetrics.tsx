"use client";

import React, { useEffect, useState } from "react";
import { Users, FolderKanban, Wallet, Key, TrendingUp, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function TeamsTopMetrics() {
  const { currentOrg, getIdToken } = useAuth();
  const [memberCount, setMemberCount] = useState(1);
  const [projectCount, setProjectCount] = useState(0);
  const [spend, setSpend] = useState("$0.00");
  const [budgetCap, setBudgetCap] = useState("$0.00");

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      if (!currentOrg?.id) return;

      try {
        const token = await getIdToken();
        const [membersRes, projRes, analyticsRes, budgetsRes] = await Promise.all([
          apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, { token }),
          apiRequest<any[]>("/api/v1/projects", { params: { organizationId: currentOrg.id }, token }),
          apiRequest<any>("/api/v1/analytics/overview", { params: { organizationId: currentOrg.id, timeRange: "30d" }, token }),
          apiRequest<any[]>("/api/v1/budgets", { params: { organizationId: currentOrg.id }, token }),
        ]);

        if (!isMounted) return;

        if (Array.isArray(membersRes.data)) {
          setMemberCount(membersRes.data.length);
        }
        if (Array.isArray(projRes.data)) {
          setProjectCount(projRes.data.length);
        }
        if (analyticsRes.data?.kpis?.totalSpendUsd != null) {
          setSpend(`$${analyticsRes.data.kpis.totalSpendUsd.toFixed(2)}`);
        }
        if (Array.isArray(budgetsRes.data) && budgetsRes.data.length > 0) {
          const total = budgetsRes.data.reduce((acc, b) => acc + (b.monthlyCap || b.limitAmount || 0), 0);
          setBudgetCap(`$${total.toLocaleString()}`);
        }
      } catch (err) {
        // preserve defaults
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Members */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Total Developers &amp; Members</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">{memberCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <span>Workspace seats</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Card 2: Active Engineering Teams */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Projects &amp; Workspaces</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">{projectCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <span>Isolated tenant projects</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <FolderKanban className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Monthly AI Budget */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Monthly AI Spend</span>
          <div className="text-2xl font-bold text-[#dfba82] tracking-tight mt-1 font-mono">{spend}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Budget Ceiling: {budgetCap}</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Governance Compliance */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Access Governance</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">100%</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
            <span>Multi-tenant isolation active</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Key className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
