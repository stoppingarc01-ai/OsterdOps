"use client";

import React from "react";
import {
  Building2,
  Users,
  Key,
  Plug,
  CreditCard,
  Sliders,
  Shield,
  Database,
  ScrollText,
} from "lucide-react";

export type SettingsTabId =
  | "organization"
  | "users-teams"
  | "api-keys"
  | "integrations"
  | "billing-plan"
  | "preferences"
  | "security"
  | "data-privacy"
  | "audit-logs";

interface SettingsSidebarNavProps {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}

export const SETTINGS_TABS: {
  id: SettingsTabId;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  {
    id: "organization",
    label: "Organization",
    sublabel: "Profile, plan and billing",
    icon: Building2,
  },
  {
    id: "users-teams",
    label: "Users & Teams",
    sublabel: "Manage members and roles",
    icon: Users,
  },
  {
    id: "api-keys",
    label: "API Keys",
    sublabel: "Manage your API keys",
    icon: Key,
  },
  {
    id: "integrations",
    label: "Integrations",
    sublabel: "Connect providers and tools",
    icon: Plug,
  },
  {
    id: "billing-plan",
    label: "Billing & Plan",
    sublabel: "Manage subscription",
    icon: CreditCard,
  },
  {
    id: "preferences",
    label: "Preferences",
    sublabel: "Regional and language",
    icon: Sliders,
  },
  {
    id: "security",
    label: "Security",
    sublabel: "Password and 2FA",
    icon: Shield,
  },
  {
    id: "data-privacy",
    label: "Data & Privacy",
    sublabel: "Data control and export",
    icon: Database,
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    sublabel: "View account activity",
    icon: ScrollText,
  },
];

export function SettingsSidebarNav({
  activeTab,
  onSelectTab,
}: SettingsSidebarNavProps) {
  return (
    <nav className="w-full lg:w-[280px] shrink-0 space-y-1.5" aria-label="Settings Categories">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#12141e] border border-[#dfba82]/35 shadow-[0_0_20px_rgba(223,186,130,0.08)]"
                : "bg-transparent border border-transparent hover:bg-[#0f111a] hover:border-[#1d202d] text-[#8e93a6] hover:text-white"
            }`}
          >
            {/* Tab Icon in soft container */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive
                  ? "bg-[#dfba82]/15 border border-[#dfba82]/30 text-[#dfba82]"
                  : "bg-[#11131c] border border-[#1b1e2c] text-[#787d91]"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Tab Labels */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div
                className={`text-[13.5px] font-semibold tracking-tight transition-colors ${
                  isActive ? "text-[#dfba82]" : "text-[#e2e4ec]"
                }`}
              >
                {tab.label}
              </div>
              <div className="text-[11px] text-[#73788c] mt-0.5 truncate">
                {tab.sublabel}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
