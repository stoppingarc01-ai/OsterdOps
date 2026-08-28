"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BillingHeader } from "@/components/billing/BillingHeader";
import { BillingTabs } from "@/components/billing/BillingTabs";
import { BillingTopMetrics } from "@/components/billing/BillingTopMetrics";
import { BudgetCapsTableCard } from "@/components/billing/BudgetCapsTableCard";
import { InvoiceHistoryCard } from "@/components/billing/InvoiceHistoryCard";
import { PlanTierCard } from "@/components/billing/PlanTierCard";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { BillingGuardrailsCard } from "@/components/billing/BillingGuardrailsCard";
import { CreateBudgetModal } from "@/components/billing/CreateBudgetModal";
import { ContentTransition } from "@/components/layout/ContentTransition";

export default function BillingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main Billing Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <BillingHeader onOpenCreateBudget={() => setIsCreateOpen(true)} />

            {/* Sub-header Navigation Tabs Bar */}
            <BillingTabs />

            {/* Row 1: Top 4 Metric Cards */}
            <BillingTopMetrics />

            {/* Main Grid: Left Budgets & Invoices vs Right Subscription & Payment Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Spending Limits Table & Invoice Statements */}
              <div className="lg:col-span-8 space-y-6">
                <BudgetCapsTableCard onOpenCreateBudget={() => setIsCreateOpen(true)} />
                <InvoiceHistoryCard />
              </div>

              {/* Right Column: Plan Tier, Payment Method, Automation Rules */}
              <div className="lg:col-span-4 space-y-6">
                <PlanTierCard />
                <PaymentMethodCard />
                <BillingGuardrailsCard />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-[#161824] flex items-center justify-between text-xs text-[#555a6d]">
              <div>OsterdOps Cloud Billing Governance & Multi-Model Invoicing Engine v2.4</div>
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

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
