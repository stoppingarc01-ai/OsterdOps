"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ModelsHeader } from "@/components/models/ModelsHeader";
import { ModelsTopMetrics } from "@/components/models/ModelsTopMetrics";
import { ModelsTableCard } from "@/components/models/ModelsTableCard";
import { ModelsSpendByProviderCard } from "@/components/models/ModelsSpendByProviderCard";
import { ModelEfficiencyLeaderboardCard } from "@/components/models/ModelEfficiencyLeaderboardCard";
import { ModelDistributionCard } from "@/components/models/ModelDistributionCard";
import { TopSpendIncreaseCard } from "@/components/models/TopSpendIncreaseCard";
import { AddModelModal } from "@/components/models/AddModelModal";

import { ContentTransition } from "@/components/layout/ContentTransition";

export default function ModelsPage() {
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Models Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <ModelsHeader />

            {/* Top 4 Metrics Cards */}
            <ModelsTopMetrics />

            {/* Main Grid: Left Table vs Right Analytics Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search Filter Bar & Models Table */}
              <div className="lg:col-span-8">
                <ModelsTableCard onOpenAddModel={() => setIsAddModelOpen(true)} />
              </div>

              {/* Right Column: Spend by Provider, Efficiency Leaderboard, Distribution, Spend Increase */}
              <div className="lg:col-span-4 space-y-6">
                <ModelsSpendByProviderCard />
                <ModelEfficiencyLeaderboardCard />
                <ModelDistributionCard />
                <TopSpendIncreaseCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps AI Model Analytics Engine v2.4</div>
              <div className="flex items-center gap-4">
                <Link href="/developers" className="hover:text-[#dfba82] transition-colors">Docs</Link>
                <Link href="/developers/api" className="hover:text-[#dfba82] transition-colors">API</Link>
                <Link href="/admin/system" className="hover:text-[#dfba82] transition-colors">Status</Link>
                <Link href="/contact" className="hover:text-[#dfba82] transition-colors">Support</Link>
              </div>
            </footer>
          </div>
        </ContentTransition>
      </main>

      {/* Add Model Modal */}
      <AddModelModal
        isOpen={isAddModelOpen}
        onClose={() => setIsAddModelOpen(false)}
      />
    </div>
  );
}
