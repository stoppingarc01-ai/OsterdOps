"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { ModelsTableCard } from "@/components/models/ModelsTableCard";
import { Cpu } from "lucide-react";

export default function DashboardModelsPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Model Pricing & Registry
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  LLM Pricing Registry & Cost Directory
                </h1>
              </div>
            </div>

            <ModelsTableCard onOpenAddModel={() => {}} />
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
