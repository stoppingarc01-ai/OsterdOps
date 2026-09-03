"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { ReportsTopMetrics } from "@/components/reports/ReportsTopMetrics";
import { SpendOverTimeChartCard } from "@/components/reports/SpendOverTimeChartCard";
import { SpendByProviderTableCard } from "@/components/reports/SpendByProviderTableCard";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { TopProjectsBySpendCard } from "@/components/reports/TopProjectsBySpendCard";
import { ReportActionsCard } from "@/components/reports/ReportActionsCard";
import { SavedReportsCard } from "@/components/reports/SavedReportsCard";
import { ContentTransition } from "@/components/layout/ContentTransition";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Reports Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <ReportsHeader />

            {/* Sub-header Navigation Tabs Bar */}
            <ReportsTabs />

            {/* Row 1: Top 5 Metric Cards */}
            <ReportsTopMetrics />

            {/* Row 2: Spend Over Time Line Chart (Left) vs Summary & Top Projects (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <SpendOverTimeChartCard />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <ReportSummaryCard />
                <TopProjectsBySpendCard />
              </div>
            </div>

            {/* Row 3: Spend by Provider Table (Left) vs Report Actions & Saved Reports (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <SpendByProviderTableCard />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <ReportActionsCard />
                <SavedReportsCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps Analytics & Reporting Engine v2.4</div>
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
    </div>
  );
}
