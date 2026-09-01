"use client";

import React from "react";
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
} from "lucide-react";

export function AdminOverviewView() {
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
            <div className="text-2xl font-bold text-white font-mono">$1,842.20</div>
            <div className="text-xs text-[#8e93a6] font-mono">/ $2,500.00</div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#8e93a6] mb-1">
              <span>Budget Utilization</span>
              <span className="font-mono text-amber-400 font-semibold">73.7%</span>
            </div>
            <div className="w-full bg-[#1b202e] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: "73.7%" }} />
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
            <div className="text-2xl font-bold text-white font-mono">148,290</div>
            <div className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Avg Latency (p50)</span>
            <span className="font-mono text-white">142 ms</span>
          </div>
        </div>

        {/* Security Posture */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-emerald-400 font-mono">100 / 100</div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              GRADE A+
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Audit Integrity</span>
            <span className="text-emerald-400 font-semibold">100% SHA-256 Valid</span>
          </div>
        </div>

        {/* System Probes */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>System Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white font-mono">8 / 8</div>
            <span className="text-xs text-emerald-400 font-semibold">OPERATIONAL</span>
          </div>
          <div className="mt-3 text-[11px] text-[#8e93a6] flex items-center justify-between">
            <span>Active Outages</span>
            <span className="text-emerald-400 font-semibold">0 incidents</span>
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
            Budgets &amp; Enforcement
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Set hard spending caps, pause/resume limits, and configure proactive thresholds.
          </p>
        </Link>

        {/* Security & Audit Card */}
        <Link
          href="/admin/security"
          className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 hover:border-[#dfba82]/50 hover:bg-[#0f121b] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white mt-4 group-hover:text-[#dfba82] transition-colors">
            Security &amp; Audit Center
          </h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Audit logs with SHA-256 hash chains, security posture evaluations, and retention rules.
          </p>
        </Link>
      </div>

      {/* Privacy and Multi-Tenant Isolation Seal */}
      <div className="p-4 rounded-2xl bg-[#090b10] border border-[#171b26] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#dfba82]" />
          <div>
            <div className="text-xs font-semibold text-white">
              Enterprise Governance &amp; Multi-Tenant Privacy Shield
            </div>
            <div className="text-[11px] text-[#8e93a6]">
              Tenant boundary enforced at database query layer. Zero prompt or plaintext key retention in system telemetry.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Server Authorization Active</span>
        </div>
      </div>
    </div>
  );
}
