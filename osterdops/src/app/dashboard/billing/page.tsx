"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { BillingHeader } from "@/components/billing/BillingHeader";
import { BillingTabs } from "@/components/billing/BillingTabs";
import { BillingTopMetrics } from "@/components/billing/BillingTopMetrics";
import { PlanTierCard } from "@/components/billing/PlanTierCard";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { BillingGuardrailsCard } from "@/components/billing/BillingGuardrailsCard";
import { InvoiceHistoryCard } from "@/components/billing/InvoiceHistoryCard";
import { BudgetCapsTableCard } from "@/components/billing/BudgetCapsTableCard";
import { CreateBudgetModal } from "@/components/billing/CreateBudgetModal";

export default function DashboardBillingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <BillingHeader onOpenCreateBudget={() => setIsCreateOpen(true)} />
            <BillingTabs />
            <BillingTopMetrics />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <BudgetCapsTableCard onOpenCreateBudget={() => setIsCreateOpen(true)} />
                <InvoiceHistoryCard />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <PlanTierCard />
                <PaymentMethodCard />
                <BillingGuardrailsCard />
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>

      <CreateBudgetModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
