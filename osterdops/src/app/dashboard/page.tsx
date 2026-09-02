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
import { RequestsTable } from "@/components/analytics/RequestsTable";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { PlanSelectionModal } from "@/components/onboarding/PlanSelectionModal";
import { useAuth } from "@/context/AuthContext";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";

export default function DashboardPage() {
  const { user, userProfile, currentOrg, refreshUser } = useAuth();
  const displayName = userProfile?.name || user?.displayName || (user?.email ? user.email.split("@")[0] : "Workspace Lead");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Prompt plan selection if current workspace has no planTier set
  React.useEffect(() => {
    if (currentOrg && !currentOrg.planTier) {
      setIsPlanModalOpen(true);
    }
  }, [currentOrg]);

  // Global Real-Time Telemetry Pipeline
  const { data: telemetry, isLoading, refetch, lastUpdated } = useLiveTelemetry({
    timeRange: "30d",
    pollIntervalMs: 4000,
  });

  const handleSelectAction = (actionTitle: string) => {
    if (actionTitle.includes("Simulator")) {
      setIsSimulatorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col selection:bg-[#DFB277] selection:text-[#0E0E0E] font-sans relative overflow-x-hidden">
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
              <StatCardsBar telemetry={telemetry} isLoading={isLoading} />

              {/* Live LLM Routing Proxy Pipeline Diagram Widget */}
              <LLMRoutingGatewayWidget telemetry={telemetry} isLoading={isLoading} />

              {/* Middle Row: AI Spend Over Time (Chart) + Active Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <AISpendChartCard telemetry={telemetry} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-4">
                  <ActiveAlertsCard />
                </div>
              </div>

              {/* Live Request Stream Table */}
              <RequestsTable requests={telemetry.recentRequests} isLoading={isLoading} maxRows={10} />

              {/* Bottom Grid Row 1: Spend by Provider, Top Projects, Spend by Model, AI Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <SpendByProviderCard telemetry={telemetry} isLoading={isLoading} />
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
              <footer className="pt-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
                <div>OsterdOps AI Cost Governance Enterprise Platform v2.4</div>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-[#DFB277] transition-colors">Docs</a>
                  <a href="#" className="hover:text-[#DFB277] transition-colors">API</a>
                  <a href="#" className="hover:text-[#DFB277] transition-colors">Status</a>
                  <a href="#" className="hover:text-[#DFB277] transition-colors">Support</a>
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

      {/* Mandatory Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={isPlanModalOpen}
        orgId={currentOrg?.id}
        currentPlanTier={currentOrg?.planTier || "growth"}
        onPlanSelected={async () => {
          setIsPlanModalOpen(false);
          await refreshUser();
        }}
        isMandatory={true}
      />
    </div>
  );
}
