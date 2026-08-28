"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";
import { EditOrganizationModal } from "./EditOrganizationModal";
import { ManageIntegrationModal, IntegrationItem } from "./ManageIntegrationModal";
import { AddIntegrationModal } from "./AddIntegrationModal";
import { useThemeCustomizer } from "@/context/ThemeCustomizerContext";

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "openai",
    name: "OpenAI",
    badge: "Connected",
    addedDate: "Added on Apr 12, 2025",
    totalSpend: "$2,450.21",
    status: "Connected",
    provider: "OpenAI",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    badge: "Connected",
    addedDate: "Added on Apr 12, 2025",
    totalSpend: "$1,210.43",
    status: "Connected",
    provider: "Anthropic",
  },
  {
    id: "google",
    name: "Google Gemini",
    badge: "Connected",
    addedDate: "Added on Apr 14, 2025",
    totalSpend: "$412.32",
    status: "Connected",
    provider: "Google",
  },
];

export function OrganizationSettingsView() {
  // Organization State
  const [orgData, setOrgData] = useState({
    name: "Acme Corporation",
    domain: "acme-corp.osterdops.com",
    email: "billing@acme.com",
    plan: "Enterprise",
    members: 24,
    projects: 8,
    spendThisMonth: "$4,328.64",
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
  const [integrations, setIntegrations] =
    useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);

  // Theme customizer hook
  const { accent } = useThemeCustomizer();

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
          {/* Gold Building Logo */}
          <div className="w-14 h-14 rounded-2xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0 shadow-[0_0_15px_rgba(223,186,130,0.12)]">
            <Building2 className="w-7 h-7" />
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
            <div className="text-xl font-bold text-white mt-1">
              {orgData.members}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#787d91]">Projects</div>
            <div className="text-xl font-bold text-white mt-1">
              {orgData.projects}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#787d91]">AI Spend (This Month)</div>
            <div className="text-xl font-bold text-white mt-1">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-medium text-[#e2e4ec]">Time Zone</div>
                <div className="text-[11px] text-[#73788c]">
                  Set your default time zone.
                </div>
              </div>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="appearance-none bg-[#121522] border border-[#23273a] hover:border-[#dfba82]/40 rounded-xl px-3.5 py-2 pr-8 text-xs text-white focus:outline-none cursor-pointer min-w-[190px]"
                >
                  <option value="(GMT+05:30) Asia/Kolkata">
                    (GMT+05:30) Asia/Kolkata
                  </option>
                  <option value="(GMT-07:00) America/Los_Angeles">
                    (GMT-07:00) Pacific Time
                  </option>
                  <option value="(GMT-04:00) America/New_York">
                    (GMT-04:00) Eastern Time
                  </option>
                  <option value="(GMT+00:00) UTC">
                    (GMT+00:00) UTC
                  </option>
                  <option value="(GMT+01:00) Europe/London">
                    (GMT+01:00) London
                  </option>
                  <option value="(GMT+09:00) Asia/Tokyo">
                    (GMT+09:00) Tokyo
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date Format */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-medium text-[#e2e4ec]">Date Format</div>
                <div className="text-[11px] text-[#73788c]">
                  Choose how dates are displayed.
                </div>
              </div>
              <div className="relative">
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="appearance-none bg-[#121522] border border-[#23273a] hover:border-[#dfba82]/40 rounded-xl px-3.5 py-2 pr-8 text-xs text-white focus:outline-none cursor-pointer min-w-[140px]"
                >
                  <option value="May 16, 2025">May 16, 2025</option>
                  <option value="2025-05-16">2025-05-16</option>
                  <option value="16/05/2025">16/05/2025</option>
                  <option value="16 May 2025">16 May 2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Number Format */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-medium text-[#e2e4ec]">Number Format</div>
                <div className="text-[11px] text-[#73788c]">
                  Choose how numbers are displayed.
                </div>
              </div>
              <div className="relative">
                <select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  className="appearance-none bg-[#121522] border border-[#23273a] hover:border-[#dfba82]/40 rounded-xl px-3.5 py-2 pr-8 text-xs text-white focus:outline-none cursor-pointer min-w-[130px]"
                >
                  <option value="1,234.56">1,234.56</option>
                  <option value="1.234,56">1.234,56</option>
                  <option value="1 234,56">1 234,56</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <div className="font-medium text-[#e2e4ec]">Theme</div>
                <div className="text-[11px] text-[#73788c]">
                  Choose your preferred theme.
                </div>
              </div>
              <div className="flex items-center p-1 bg-[#121522] border border-[#23273a] rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedTheme("light")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedTheme === "light"
                      ? "bg-[#dfba82] text-black font-bold shadow-xs"
                      : "text-[#787d91] hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme("dark")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedTheme === "dark"
                      ? "bg-[#08090f] text-[#dfba82] border border-[#dfba82]/40 shadow-[0_0_10px_rgba(223,186,130,0.15)] font-semibold"
                      : "text-[#787d91] hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Your Plan Card */}
        <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Your Plan</h2>

            {/* Plan Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0 shadow-[0_0_20px_rgba(223,186,130,0.15)]">
                <Crown className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Enterprise Plan
                </h3>
                <p className="text-xs text-[#8e93a6] leading-relaxed mt-0.5">
                  Unlimited everything. Advanced governance, SAML SSO, priority support.
                </p>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2 pt-2 text-xs">
              {[
                "Unlimited projects",
                "Advanced governance",
                "All integrations",
                "Priority support",
                "SAML SSO & SCIM",
                "Custom data retention",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-[#c5c9d6]">
                  <Check className="w-3.5 h-3.5 text-[#dfba82] stroke-[2.5] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Billing Details Link */}
          <div className="pt-2">
            <Link
              href="/billing"
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
        <h2 className="text-[15px] font-semibold text-white">
          Connected Integrations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-[#dfba82]/30 transition-all group"
            >
              <div className="space-y-3">
                {/* Header: Icon + Name + Badge */}
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

                {/* Info */}
                <div className="space-y-0.5 text-xs text-[#787d91]">
                  <div>{item.addedDate}</div>
                  <div className="font-medium text-[#c5c9d6]">
                    Total Spend: {item.totalSpend}
                  </div>
                </div>
              </div>

              {/* Manage Button */}
              <button
                type="button"
                onClick={() => setSelectedIntegrationForManage(item)}
                className="w-full py-1.5 rounded-xl bg-[#121422] border border-[#23273a] hover:border-[#dfba82]/40 text-xs font-semibold text-[#c5c9d6] hover:text-white transition-all cursor-pointer text-center"
              >
                Manage
              </button>
            </div>
          ))}

          {/* 4th Card: Add Integration Dashed Card */}
          <button
            type="button"
            onClick={() => setIsAddIntegrationOpen(true)}
            className="p-5 bg-[#090b12]/50 border-2 border-dashed border-[#1f2334] hover:border-[#dfba82]/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-[#121524]/60 transition-all cursor-pointer group min-h-[160px]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#121522] border border-[#232738] group-hover:border-[#dfba82]/40 text-[#dfba82] flex items-center justify-center transition-transform group-hover:scale-110">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#dfba82] transition-colors">
                Add Integration
              </div>
              <p className="text-[11px] text-[#73788c] max-w-[180px] mt-0.5 leading-snug">
                Connect a new provider or tool to get started.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditOrganizationModal
        isOpen={isEditOrgOpen}
        onClose={() => setIsEditOrgOpen(false)}
        orgData={orgData}
        onSave={handleUpdateOrg}
      />

      <ManageIntegrationModal
        isOpen={!!selectedIntegrationForManage}
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
