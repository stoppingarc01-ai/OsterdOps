"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TeamsHeader } from "@/components/teams/TeamsHeader";
import { TeamsTabs } from "@/components/teams/TeamsTabs";
import { TeamsTopMetrics } from "@/components/teams/TeamsTopMetrics";
import { TeamsTableCard } from "@/components/teams/TeamsTableCard";
import { SpendByTeamCard } from "@/components/teams/SpendByTeamCard";
import { TopDevelopersLeaderboardCard } from "@/components/teams/TopDevelopersLeaderboardCard";
import { TeamGuardrailsCard } from "@/components/teams/TeamGuardrailsCard";
import { InviteMemberModal } from "@/components/teams/InviteMemberModal";
import { ContentTransition } from "@/components/layout/ContentTransition";

export default function TeamsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Teams Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <TeamsHeader onOpenInvite={() => setIsInviteOpen(true)} />

            {/* Sub-header Navigation Tabs Bar */}
            <TeamsTabs />

            {/* Row 1: Top 4 Metric Cards */}
            <TeamsTopMetrics />

            {/* Main Grid: Left Table vs Right Analytics Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search Filter Bar & Developers Table */}
              <div className="lg:col-span-8">
                <TeamsTableCard onOpenInvite={() => setIsInviteOpen(true)} />
              </div>

              {/* Right Column: Spend by Team, Top Developer Spenders, Guardrails */}
              <div className="lg:col-span-4 space-y-6">
                <SpendByTeamCard />
                <TopDevelopersLeaderboardCard />
                <TeamGuardrailsCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps Team Access & Developer Governance Engine v2.4</div>
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

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}
