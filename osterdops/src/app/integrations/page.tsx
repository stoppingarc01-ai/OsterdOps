"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { IntegrationsHeader } from "@/components/integrations/IntegrationsHeader";
import { IntegrationsTabs } from "@/components/integrations/IntegrationsTabs";
import { IntegrationsTopMetrics } from "@/components/integrations/IntegrationsTopMetrics";
import { IntegrationsGridCard } from "@/components/integrations/IntegrationsGridCard";
import { ConnectorIngestionCard } from "@/components/integrations/ConnectorIngestionCard";
import { RecentSyncLogCard } from "@/components/integrations/RecentSyncLogCard";
import { ProxyGatewayConfigCard } from "@/components/integrations/ProxyGatewayConfigCard";
import { ConnectIntegrationModal } from "@/components/integrations/ConnectIntegrationModal";
import { ContentTransition } from "@/components/layout/ContentTransition";

export default function IntegrationsPage() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("OpenAI");

  const handleOpenConnect = (item?: { name: string }) => {
    if (item) setSelectedProvider(item.name);
    setIsConnectOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Integrations Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <IntegrationsHeader onOpenConnect={() => handleOpenConnect()} />

            {/* Sub-header Navigation Tabs Bar */}
            <IntegrationsTabs />

            {/* Row 1: Top 4 Metric Cards */}
            <IntegrationsTopMetrics />

            {/* Main Grid: Left Connectors Catalog vs Right Traffic & Gateway Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search Filter Bar & 12 Connectors Grid */}
              <div className="lg:col-span-8">
                <IntegrationsGridCard onOpenConnect={handleOpenConnect} />
              </div>

              {/* Right Column: Ingestion Donut, Sync Log, Gateway Config */}
              <div className="lg:col-span-4 space-y-6">
                <ConnectorIngestionCard />
                <RecentSyncLogCard />
                <ProxyGatewayConfigCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps Cloud Integrations & LLM Proxy Ingestion Gateway v2.4</div>
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

      {/* Connect Integration Modal */}
      <ConnectIntegrationModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        initialProvider={selectedProvider}
      />
    </div>
  );
}
