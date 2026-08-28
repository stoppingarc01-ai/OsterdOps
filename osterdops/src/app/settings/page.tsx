"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import {
  SettingsSidebarNav,
  SettingsTabId,
} from "@/components/settings/SettingsSidebarNav";
import { OrganizationSettingsView } from "@/components/settings/OrganizationSettingsView";
import { SecuritySettingsCard } from "@/components/settings/SecuritySettingsCard";
import { GovernancePoliciesCard } from "@/components/settings/GovernancePoliciesCard";
import { AuditLogsCard } from "@/components/settings/AuditLogsCard";
import { NotificationSettingsCard } from "@/components/settings/NotificationSettingsCard";
import { GenerateApiKeyModal } from "@/components/settings/GenerateApiKeyModal";
import { ContentTransition } from "@/components/layout/ContentTransition";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("organization");
  const [isGenerateKeyOpen, setIsGenerateKeyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Global Navigation Sidebar */}
      <AppSidebar />

      {/* Main Settings Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-[1520px] mx-auto">
        <ContentTransition>
          <div className="space-y-6">
            {/* Top Settings Header */}
            <SettingsHeader />

            {/* Sub-Layout: Left Settings Categories Nav + Right Dynamic Content Panel */}
            <div className="flex flex-col lg:flex-row items-start gap-6 pt-1">
              {/* Left Vertical Settings Nav */}
              <SettingsSidebarNav
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />

              {/* Right Content Panel */}
              <div className="flex-1 w-full min-w-0">
                {activeTab === "organization" && <OrganizationSettingsView />}

                {activeTab === "users-teams" && (
                  <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[15px] font-semibold text-white">
                          Users & Team Management
                        </h2>
                        <p className="text-xs text-[#787d91] mt-0.5">
                          Manage organization members, workspace access, and role permissions.
                        </p>
                      </div>
                    </div>
                    {/* Quick Link or Embedded Member list */}
                    <div className="p-4 bg-[#121522] border border-[#23273a] rounded-xl flex items-center justify-between">
                      <div className="text-xs text-[#c5c9d6]">
                        24 active members in <span className="text-[#dfba82] font-semibold">Acme Corporation</span>
                      </div>
                      <a
                        href="/teams"
                        className="px-3.5 py-1.5 rounded-xl bg-[#dfba82] text-black font-bold text-xs hover:bg-[#ebd5ab] transition-all"
                      >
                        Open Full Teams Dashboard &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === "api-keys" && (
                  <SecuritySettingsCard
                    onOpenGenerateKey={() => setIsGenerateKeyOpen(true)}
                  />
                )}

                {activeTab === "integrations" && <OrganizationSettingsView />}

                {activeTab === "billing-plan" && (
                  <div className="p-6 bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl space-y-6">
                    <div>
                      <h2 className="text-[15px] font-semibold text-white">
                        Billing & Subscription Tier
                      </h2>
                      <p className="text-xs text-[#787d91] mt-0.5">
                        Manage payment methods, invoices, and active compute tier.
                      </p>
                    </div>
                    <div className="p-4 bg-[#121522] border border-[#23273a] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Enterprise Plan</div>
                        <div className="text-xs text-[#787d91] mt-0.5">
                          Renews automatically with consolidated multi-cloud billing.
                        </div>
                      </div>
                      <a
                        href="/billing"
                        className="px-3.5 py-1.5 rounded-xl bg-[#dfba82] text-black font-bold text-xs hover:bg-[#ebd5ab] transition-all"
                      >
                        Manage Billing & Invoices &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && <OrganizationSettingsView />}

                {activeTab === "security" && (
                  <SecuritySettingsCard
                    onOpenGenerateKey={() => setIsGenerateKeyOpen(true)}
                  />
                )}

                {activeTab === "data-privacy" && <GovernancePoliciesCard />}

                {activeTab === "audit-logs" && <AuditLogsCard />}
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#555a6d]">
              <div>OsterdOps Workspace Governance & Access Control Engine v2.4</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-[#dfba82] transition-colors">Docs</a>
                <a href="#" className="hover:text-[#dfba82] transition-colors">Security Audit</a>
                <a href="#" className="hover:text-[#dfba82] transition-colors">Compliance</a>
                <a href="#" className="hover:text-[#dfba82] transition-colors">Support</a>
              </div>
            </footer>
          </div>
        </ContentTransition>
      </main>

      {/* Generate API Key Modal */}
      <GenerateApiKeyModal
        isOpen={isGenerateKeyOpen}
        onClose={() => setIsGenerateKeyOpen(false)}
      />
    </div>
  );
}
