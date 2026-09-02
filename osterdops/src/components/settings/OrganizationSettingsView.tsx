"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Edit3,
  Copy,
  Check,
  Crown,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";
import { EditOrganizationModal } from "./EditOrganizationModal";
import { ManageIntegrationModal, IntegrationItem } from "./ManageIntegrationModal";
import { AddIntegrationModal } from "./AddIntegrationModal";
import { useThemeCustomizer } from "@/context/ThemeCustomizerContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function OrganizationSettingsView() {
  const { currentOrg, user, getIdToken } = useAuth();

  // Organization State
  const [orgData, setOrgData] = useState({
    name: currentOrg?.name || "Workspace",
    domain: `${currentOrg?.slug || "workspace"}.osterdops.com`,
    email: user?.email || "",
    plan: currentOrg?.planTier ? `${currentOrg.planTier.toUpperCase()} Tier` : "Free Tier",
    members: 1,
    projects: 0,
    spendThisMonth: "$0.00",
  });

  // Preferences State
  const [currency, setCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("(GMT+05:30) Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("May 16, 2025");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("dark");

  // Copy feedback
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Modals state
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
  const [isAddIntegrationOpen, setIsAddIntegrationOpen] = useState(false);
  const [selectedIntegrationForManage, setSelectedIntegrationForManage] =
    useState<IntegrationItem | null>(null);

  // Integrations list state
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrgStats() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const [membersRes, projectsRes, analyticsRes] = await Promise.all([
          apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, { token }),
          apiRequest<any[]>("/api/v1/projects", { params: { organizationId: currentOrg.id }, token }),
          apiRequest<any>("/api/v1/analytics/overview", { params: { organizationId: currentOrg.id, timeRange: "30d" }, token }),
        ]);

        if (!isMounted) return;

        const memberCount = Array.isArray(membersRes.data) ? membersRes.data.length : 1;
        const projectCount = Array.isArray(projectsRes.data) ? projectsRes.data.length : 0;
        const spend = analyticsRes.data?.kpis?.totalSpendUsd != null ? `$${analyticsRes.data.kpis.totalSpendUsd.toFixed(2)}` : "$0.00";

        setOrgData({
          name: currentOrg.name || "Workspace",
          domain: `${currentOrg.slug || "workspace"}.osterdops.com`,
          email: user?.email || "",
          plan: currentOrg.planTier ? `${currentOrg.planTier.toUpperCase()} Tier` : "Free Tier",
          members: memberCount,
          projects: projectCount,
          spendThisMonth: spend,
        });
      } catch (err) {
        // preserve defaults
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrgStats();

    return () => {
      isMounted = false;
    };
  }, [currentOrg, user, getIdToken]);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(orgData.domain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleUpdateOrg = (updated: {
    name: string;
    domain: string;
    email: string;
    plan: string;
  }) => {
    setOrgData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleUpdateIntegration = (updated: IntegrationItem) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleDisconnectIntegration = (id: string) => {
    setIntegrations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddIntegration = (newIntegration: IntegrationItem) => {
    setIntegrations((prev) => [...prev, newIntegration]);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* 1. Organization Profile Card */}
      <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            Organization Profile
          </h2>
          <button
            type="button"
            onClick={() => setIsEditOrgOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#090b12] border border-[#dfba82]/40 hover:border-[#dfba82] hover:bg-[#dfba82]/10 text-[#dfba82] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Organization</span>
          </button>
        </div>

        {/* Profile Details Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0 shadow-[0_0_15px_rgba(223,186,130,0.12)] font-bold text-lg">
            {(orgData.name || "O").slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {orgData.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 text-[11px] font-semibold">
                {orgData.plan}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8e93a6]">
              <span className="font-mono text-[#c5c9d6]">{orgData.domain}</span>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="p-1 text-[#787d91] hover:text-[#dfba82] transition-colors cursor-pointer"
                title="Copy Domain URL"
              >
                {copiedDomain ? (
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {copiedDomain && (
                <span className="text-[10.5px] text-[#10b981] font-medium animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-[#73788c]">
              Manage your organization details and preferences.
            </p>
          </div>
        </div>

        {/* 4-Metric Grid Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#161824]">
          <div>
            <div className="text-xs text-[#787d91]">Members</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {orgData.members}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#787d91]">Projects</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {orgData.projects}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#787d91]">AI Spend (30d)</div>
            <div className="text-xl font-bold text-[#dfba82] mt-1 font-mono">
              {orgData.spendThisMonth}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#787d91]">Plan</div>
            <div className="text-xl font-bold text-white mt-1">
              {orgData.plan}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Preferences + Your Plan (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Preferences */}
        <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl shadow-sm space-y-4">
          <h2 className="text-[15px] font-semibold text-white">Preferences</h2>

          <div className="space-y-4 text-xs">
            {/* Default Currency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-medium text-[#e2e4ec]">Default Currency</div>
                <div className="text-[11px] text-[#73788c]">
                  Set the default currency for all costs.
                </div>
              </div>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="appearance-none bg-[#121522] border border-[#23273a] hover:border-[#dfba82]/40 rounded-xl px-3.5 py-2 pr-8 text-xs text-white focus:outline-none cursor-pointer min-w-[130px]"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Time Zone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#161824]">
              <div>
                <div className="font-medium text-[#e2e4ec]">Time Zone</div>
                <div className="text-[11px] text-[#73788c]">
                  Used for charts and usage aggregations.
                </div>
              </div>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="appearance-none bg-[#121522] border border-[#23273a] hover:border-[#dfba82]/40 rounded-xl px-3.5 py-2 pr-8 text-xs text-white focus:outline-none cursor-pointer min-w-[180px]"
                >
                  <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                  <option value="(UTC-07:00) America/Los_Angeles">(UTC-07:00) Pacific Time</option>
                  <option value="(UTC-04:00) America/New_York">(UTC-04:00) Eastern Time</option>
                  <option value="(UTC+00:00) Europe/London">(UTC+00:00) London</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Your Plan */}
        <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Your Plan</h2>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {orgData.plan}
                </h3>
                <p className="text-xs text-[#8e93a6] leading-relaxed mt-0.5">
                  High-throughput gateway routing, live budget enforcements, and audit logs.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {[
                "Unlimited projects",
                "Advanced governance & alerts",
                "Proxy gateway execution",
                "Tamper-evident audit trail",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-[#c5c9d6]">
                  <Check className="w-3.5 h-3.5 text-[#dfba82] stroke-[2.5] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd5ab] transition-colors group cursor-pointer"
            >
              <span>View billing details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Connected Integrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            Connected Integrations
          </h2>
          <button
            type="button"
            onClick={() => setIsAddIntegrationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Integration</span>
          </button>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#73788c] bg-[#0c0e17] rounded-2xl border border-[#1b1e2c] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white">No external integrations connected</div>
            <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
              Connect external upstream providers like OpenAI, Anthropic, or Gemini to link billing credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-[#dfba82]/30 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <IntegrationLogoBadge id={item.id} size={30} />
                      <div className="font-semibold text-sm text-white">
                        {item.name}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-semibold">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-xs text-[#787d91]">
                    <div>{item.addedDate}</div>
                    <div className="font-medium text-[#c5c9d6]">
                      Total Spend: {item.totalSpend}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedIntegrationForManage(item)}
                  className="w-full py-1.5 rounded-xl bg-[#121422] border border-[#23273a] hover:border-[#dfba82]/40 text-xs font-semibold text-[#c5c9d6] hover:text-white transition-all cursor-pointer text-center"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditOrganizationModal
        isOpen={isEditOrgOpen}
        onClose={() => setIsEditOrgOpen(false)}
        orgData={orgData}
        onSave={handleUpdateOrg}
      />

      <ManageIntegrationModal
        isOpen={selectedIntegrationForManage !== null}
        onClose={() => setSelectedIntegrationForManage(null)}
        integration={selectedIntegrationForManage}
        onUpdate={handleUpdateIntegration}
        onDisconnect={handleDisconnectIntegration}
      />

      <AddIntegrationModal
        isOpen={isAddIntegrationOpen}
        onClose={() => setIsAddIntegrationOpen(false)}
        onAdd={handleAddIntegration}
      />
    </div>
  );
}
