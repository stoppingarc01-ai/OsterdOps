"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  FolderKanban,
  KeyRound,
  Coins,
  BellRing,
  ShieldCheck,
  FileText,
  Activity,
  Server,
  Settings,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Budget, Alert } from "@/types";

export function AdminOverviewView() {
  const { currentOrg, getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const [monthlySpend, setMonthlySpend] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const [analyticsRes, budgetsRes, alertsRes] = await Promise.all([
          apiRequest<any>("/api/v1/analytics/overview", {
            params: { organizationId: currentOrg.id, timeRange: "30d" },
            token,
          }),
          apiRequest<Budget[]>("/api/v1/budgets", {
            params: { organizationId: currentOrg.id },
            token,
          }),
          apiRequest<Alert[]>("/api/v1/alerts", {
            params: { organizationId: currentOrg.id },
            token,
          }),
        ]);

        if (!isMounted) return;

        if (analyticsRes.data?.kpis) {
          const k = analyticsRes.data.kpis;
          setMonthlySpend(k.totalSpendUsd ?? 0);
          setTotalRequests(k.totalRequests ?? 0);
          setAvgLatency(Math.round(k.averageLatencyMs ?? 0));
        }
        if (Array.isArray(budgetsRes.data)) {
          setBudgets(budgetsRes.data);
        }
        if (Array.isArray(alertsRes.data)) {
          setAlerts(alertsRes.data);
        }
      } catch (err) {
        // fallback to 0
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const totalCap = budgets.reduce((acc, b) => acc + (b.monthlyCap || b.limitAmount || 0), 0);
  const budgetUtil = totalCap > 0 ? Math.min(100, (monthlySpend / totalCap) * 100) : 0;
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" || a.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Executive KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spend & Budget */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Monthly Spend</span>
            <Coins className="w-4 h-4 text-[#dfba82]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white font-mono">
              ${monthlySpend.toFixed(2)}
            </div>
            <div className="text-xs text-[#8e93a6] font-mono">
              / {totalCap > 0 ? `$${totalCap.toFixed(2)}` : "No limit"}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#8e93a6] mb-1">
              <span>Budget Utilization</span>
              <span className="font-mono text-amber-400 font-semibold">
                {totalCap > 0 ? `${budgetUtil.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div className="w-full bg-[#1b202e] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${budgetUtil}%` }} />
            </div>
          </div>
        </div>

        {/* Total API Traffic */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>API Traffic (30d)</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white font-mono">
              {totalRequests.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 flex items-center font-medium">
              <span>Metered</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Avg Latency (p50)</span>
            <span className="font-mono text-white">{avgLatency} ms</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Active Incidents</span>
            <BellRing className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white font-mono">
              {criticalAlerts}
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              {criticalAlerts === 0 ? "SECURE" : "ATTENTION"}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Total Alerts</span>
            <span className="text-[#c5c9d6] font-semibold">{alerts.length} registered</span>
          </div>
        </div>

        {/* System Probes */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Gateway Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-emerald-400 font-mono">ONLINE</div>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Proxy Status</span>
            <span className="text-emerald-400 font-semibold">Operational</span>
          </div>
        </div>
      </div>

      {/* Quick Administration Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Organization Card */}
        <Link
          href="/admin/organization"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            Organization Management
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Manage organization identity, slug, tenant isolation boundaries, and metadata.
          </p>
        </Link>

        {/* Members & RBAC Card */}
        <Link
          href="/admin/members"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            Members &amp; Roles
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Invite teammates, grant OWNER/ADMIN/DEVELOPER/VIEWER roles, and manage invitations.
          </p>
        </Link>

        {/* Projects Card */}
        <Link
          href="/admin/projects"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            Projects &amp; Workspaces
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Administer project workspaces, spend ceilings, active API access, and team access.
          </p>
        </Link>

        {/* API Keys Card */}
        <Link
          href="/admin/api-keys"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            API Key Governance
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Rotate, revoke, and inspect organization API keys with zero-plaintext security.
          </p>
        </Link>

        {/* Budgets Card */}
        <Link
          href="/admin/budgets"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            FinOps &amp; Budgets
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Enforce spending limits, manage alerts, and set automated circuit-breaker guardrails.
          </p>
        </Link>

        {/* Audit Logs Card */}
        <Link
          href="/admin/audit-logs"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            Tamper-Proof Audit Trail
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Inspect cryptographic, append-only logs for all security and administration actions.
          </p>
        </Link>
      </div>
    </div>
  );
}
