"use client";

import React from "react";
import { Check, Headphones } from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingSidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onOpenSupport: () => void;
}

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Organization" },
  { id: 3, label: "Connect Data" },
  { id: 4, label: "Preferences" },
  { id: 5, label: "Team Members" },
  { id: 6, label: "Review & Finish" },
];

export function OnboardingSidebar({
  currentStep,
  onSelectStep,
  onOpenSupport,
}: OnboardingSidebarProps) {
  return (
    <aside className="w-full lg:w-[280px] shrink-0 bg-[#090a0f] border-r border-[#1a1c28] p-6 flex flex-col justify-between select-none min-h-[580px] lg:min-h-[660px]">
      <div className="space-y-8">
        {/* Logo Branding */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[19px] font-extrabold tracking-wider text-[#f4efe6]"
              style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
            >
              OSTERDOPS
            </span>
            <span className="text-[#dfba82] text-xs leading-none animate-pulse">✦</span>
          </div>
          <p className="text-[11px] text-[#787d91] font-medium mt-0.5 tracking-tight">
            AI Cost Governance & Operations
          </p>
        </div>

        {/* Step Indicator Header */}
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#6e7387] uppercase">
            Step {currentStep} of 6
          </span>

          {/* Stepper Navigation List */}
          <nav className="mt-4 space-y-2">
            {STEPS.map((step) => {
              const isCurrent = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isCompleted || isCurrent) {
                      onSelectStep(step.id);
                    }
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#dfba82]/[0.08] text-white border border-[#dfba82]/20 shadow-[0_0_15px_rgba(223,186,130,0.05)]"
                      : isCompleted
                      ? "text-[#c2c6d6] hover:bg-white/[0.03] cursor-pointer"
                      : "text-[#52576b] cursor-not-allowed"
                  }`}
                >
                  {/* Step Icon / Circle Badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all shrink-0 ${
                      isCurrent
                        ? "bg-[#dfba82] text-[#090a0f] font-bold shadow-[0_0_10px_rgba(223,186,130,0.4)]"
                        : isCompleted
                        ? "bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/40"
                        : "border border-[#252839] text-[#52576b]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Step Label */}
                  <span className={`text-[13.5px] font-medium tracking-tight ${
                    isCurrent ? "text-white font-semibold" : ""
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Support / Help section at bottom */}
      <div className="pt-6 border-t border-[#161824] mt-auto">
        <div className="flex items-center gap-3 text-[12.5px]">
          <div className="w-8 h-8 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#8e93a6]">
            <Headphones className="w-4 h-4 text-[#dfba82]" />
          </div>
          <div>
            <div className="text-[#8e93a6] text-[11.5px] font-medium">Need help?</div>
            <button
              type="button"
              onClick={onOpenSupport}
              className="text-[12.5px] font-semibold text-[#f4efe6] hover:text-[#dfba82] transition-colors cursor-pointer text-left"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
