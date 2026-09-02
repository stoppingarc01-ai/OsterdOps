"use client";

import React, { useState } from "react";
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Server,
  Lock,
  Layers,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { PRICING_PLANS, type PlanTier, type PlanFeatureDefinition } from "@/lib/billing/plans";

interface PlanSelectionModalProps {
  isOpen: boolean;
  orgId?: string;
  currentPlanTier?: string;
  onPlanSelected: (tier: PlanTier) => Promise<void> | void;
  isMandatory?: boolean;
}

export function PlanSelectionModal({
  isOpen,
  orgId,
  currentPlanTier = "free",
  onPlanSelected,
  isMandatory = true,
}: PlanSelectionModalProps) {
  const [selectedTier, setSelectedTier] = useState<PlanTier>(
    (currentPlanTier as PlanTier) || "growth"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (orgId) {
        // Save plan selection to backend
        const res = await fetch(`/api/v1/organizations/${orgId}/plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planTier: selectedTier }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || "Failed to save selected plan.");
        }
      }

      await onPlanSelected(selectedTier);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const planTiers: PlanTier[] = ["free", "growth", "scale", "enterprise"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-none overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-5 bg-[#0A0A0A] border-b border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono text-[#DFB277] uppercase tracking-wider font-semibold">
              Step 2 of 2: Workspace Capacity
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              Select Your Workspace Plan
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Choose the FinOps perimeter and request throughput for your AI workloads. Change or cancel anytime.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Active Perimeter Ready</span>
          </div>
        </div>

        {/* Error Banner if any */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-400">
            {error}
          </div>
        )}

        {/* 4 Pricing Plan Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planTiers.map((tier) => {
            const plan = PRICING_PLANS[tier];
            const isSelected = selectedTier === tier;
            const isPopular = plan.badge === "Most Popular";

            return (
              <div
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#111111] border-[#DFB277] shadow-[0_0_20px_rgba(223,178,119,0.12)]"
                    : "bg-[#0A0A0A] border-[#161616] hover:border-[#262626] hover:bg-[#0D0D0D]"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#DFB277] text-[#0E0E0E] text-[10px] font-mono font-bold uppercase tracking-wide shadow-sm">
                    Most Popular
                  </div>
                )}

                {/* Top Plan Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-white">{plan.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#DFB277] bg-[#DFB277]"
                          : "border-neutral-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-[#0E0E0E] stroke-[3]" />}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="pt-1 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      {typeof plan.priceMonthly === "number" ? `$${plan.priceMonthly}` : "Custom"}
                    </span>
                    {typeof plan.priceMonthly === "number" && (
                      <span className="text-xs font-mono text-neutral-500">/mo</span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-snug min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Limits Breakdown */}
                  <div className="py-2.5 border-y border-[#161616] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-neutral-300">
                      <span className="text-neutral-500">Requests:</span>
                      <span className="font-semibold text-white">
                        {plan.limits.monthlyRequestLimit === Number.MAX_SAFE_INTEGER
                          ? "Unlimited"
                          : `${(plan.limits.monthlyRequestLimit / 1000).toLocaleString()}k /mo`}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300">
                      <span className="text-neutral-500">Providers:</span>
                      <span className="font-semibold text-white">
                        {plan.limits.maxProviderConnections === Number.MAX_SAFE_INTEGER
                          ? "Unlimited"
                          : `${plan.limits.maxProviderConnections} max`}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300">
                      <span className="text-neutral-500">Projects:</span>
                      <span className="font-semibold text-white">
                        {plan.limits.maxProjects === Number.MAX_SAFE_INTEGER
                          ? "Unlimited"
                          : `${plan.limits.maxProjects} max`}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Perimeter Features
                    </div>

                    <ul className="space-y-1.5 text-[11px] font-mono">
                      <li className="flex items-center gap-2">
                        {plan.features.autoDowngradeEnabled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-neutral-600 text-[10px]">•</span>
                        )}
                        <span className={plan.features.autoDowngradeEnabled ? "text-neutral-200" : "text-neutral-600 line-through"}>
                          Auto-Downgrade
                        </span>
                      </li>

                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="text-neutral-200">Runaway Loop Breaker</span>
                      </li>

                      <li className="flex items-center gap-2">
                        {plan.features.semanticCaching ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-neutral-600 text-[10px]">•</span>
                        )}
                        <span className={plan.features.semanticCaching ? "text-neutral-200" : "text-neutral-600 line-through"}>
                          Semantic Caching
                        </span>
                      </li>

                      <li className="flex items-center gap-2">
                        {plan.features.zeroDataRetentionToggle ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-neutral-600 text-[10px]">•</span>
                        )}
                        <span className={plan.features.zeroDataRetentionToggle ? "text-neutral-200" : "text-neutral-600 line-through"}>
                          Zero Data Retention
                        </span>
                      </li>

                      <li className="flex items-center gap-2">
                        <span className="text-neutral-500">SLA:</span>
                        <span className="text-neutral-300 font-semibold">{plan.features.slaGuarantee}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card Select Button */}
                <div className="pt-5">
                  <div
                    className={`w-full py-2 px-3 rounded-lg text-xs font-mono text-center font-bold transition-all ${
                      isSelected
                        ? "bg-[#DFB277] text-[#0E0E0E]"
                        : "bg-[#141414] text-neutral-300 border border-[#222222] hover:bg-[#1A1A1A]"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Tier"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Strict Deep Obsidian FinOps • Immediate gateway provision</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSelectPlan}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <span>{isSubmitting ? "Activating Plan..." : `Confirm ${PRICING_PLANS[selectedTier].name} & Launch`}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
