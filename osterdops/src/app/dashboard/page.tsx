"use client";

import React, { useState } from "react";
import { LiveTickerBar } from "@/components/dashboard/LiveTickerBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCardsBar } from "@/components/dashboard/StatCardsBar";
import { LLMRoutingGatewayWidget } from "@/components/dashboard/LLMRoutingGatewayWidget";
import { AISpendChartCard } from "@/components/dashboard/AISpendChartCard";
import { ActiveAlertsCard } from "@/components/dashboard/ActiveAlertsCard";
import { SpendByProviderCard } from "@/components/dashboard/SpendByProviderCard";
import { TopProjectsCard } from "@/components/dashboard/TopProjectsCard";
import { SpendByModelCard } from "@/components/dashboard/SpendByModelCard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { GovernanceHealthCard } from "@/components/dashboard/GovernanceHealthCard";
import { OptimizationOpportunitiesCard } from "@/components/dashboard/OptimizationOpportunitiesCard";
import { SavingsImpactCard } from "@/components/dashboard/SavingsImpactCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { CommandPaletteModal } from "@/components/dashboard/CommandPaletteModal";
import { CostSimulatorDrawer } from "@/components/dashboard/CostSimulatorDrawer";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const displayName = userProfile?.name || user?.displayName || (user?.email ? user.email.split("@")[0] : "Workspace Lead");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const handleSelectAction = (actionTitle: string) => {
    if (actionTitle.includes("Simulator")) {
      setIsSimulatorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col selection:bg-[#dfba82] selection:text-black font-sans relative overflow-x-hidden">
      {/* Top Live Ticker Bar */}
      <LiveTickerBar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <AppSidebar />

        {/* Main Dashboard Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <ContentTransition>
            <div className="space-y-6">
              {/* Top Header */}
              <DashboardHeader
                userName={displayName}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
              />

          {/* Top 5 Stat Cards Bar */}
          <StatCardsBar />

          {/* Live LLM Routing Proxy Pipeline Diagram Widget */}
          <LLMRoutingGatewayWidget />

          {/* Middle Row: AI Spend Over Time (Chart) + Active Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <AISpendChartCard />
            </div>
            <div className="lg:col-span-4">
              <ActiveAlertsCard />
            </div>
          </div>

          {/* Bottom Grid Row 1: Spend by Provider, Top Projects, Spend by Model, AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <SpendByProviderCard />
            </div>
            <div className="lg:col-span-4">
              <TopProjectsCard />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <SpendByModelCard />
              <AIInsightsCard />
            </div>
          </div>

          {/* Bottom Grid Row 2: Governance Health, Optimization Opportunities, Savings Impact, Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <GovernanceHealthCard />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <OptimizationOpportunitiesCard />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <SavingsImpactCard />
              <QuickActionsCard />
            </div>
          </div>

          {/* Dashboard Footer Links */}
          <footer className="pt-6 border-t border-[#161824] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#555a6d]">
            <div>OsterdOps AI Cost Governance Enterprise Platform v2.4</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#dfba82] transition-colors">Docs</a>
              <a href="#" className="hover:text-[#dfba82] transition-colors">API</a>
              <a href="#" className="hover:text-[#dfba82] transition-colors">Status</a>
              <a href="#" className="hover:text-[#dfba82] transition-colors">Support</a>
            </div>
          </footer>
            </div>
          </ContentTransition>
        </main>
      </div>

      {/* Advanced UI Modals & Drawers */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleSelectAction}
      />

      <CostSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
