"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { OptimizationHeader } from "@/components/optimization/OptimizationHeader";
import { OptimizationTabs } from "@/components/optimization/OptimizationTabs";
import { TopMetricCardsRow } from "@/components/optimization/TopMetricCardsRow";
import { OptimizationScoreBreakdownCard } from "@/components/optimization/OptimizationScoreBreakdownCard";
import { TopOptimizationOpportunitiesCard } from "@/components/optimization/TopOptimizationOpportunitiesCard";
import { WasteBreakdownCard } from "@/components/optimization/WasteBreakdownCard";
import { OptimizationImpactForecastCard } from "@/components/optimization/OptimizationImpactForecastCard";
import { SmartAutomationCard } from "@/components/optimization/SmartAutomationCard";
import { RecentOptimizationsCard } from "@/components/optimization/RecentOptimizationsCard";

import { ContentTransition } from "@/components/layout/ContentTransition";

export default function OptimizationPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Optimization Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <OptimizationHeader />

            {/* Navigation Tabs Bar */}
            <OptimizationTabs />

            {/* Row 1: Top 5 Metric Cards + Optimization Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <TopMetricCardsRow />
              </div>
              <div className="lg:col-span-4">
                <OptimizationScoreBreakdownCard />
              </div>
            </div>

            {/* Row 2: Top Optimization Opportunities Table + Waste Breakdown Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <TopOptimizationOpportunitiesCard />
              </div>
              <div className="lg:col-span-4">
                <WasteBreakdownCard />
              </div>
            </div>

            {/* Row 3: Optimization Impact Forecast Chart + Smart Automation & Recent Optimizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <OptimizationImpactForecastCard />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <SmartAutomationCard />
                <RecentOptimizationsCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps Optimization Engine v2.4</div>
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
