"use client";

import React from "react";
import { ArrowRight, ArrowLeft, Mail, MessageSquare, ChevronDown, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../types";

interface StepPreferencesProps {
  data: OnboardingData;
  onChange: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIMIZATION_LEVELS: Array<OnboardingData["optimizationLevel"]> = [
  "Conservative",
  "Balanced",
  "Aggressive",
];

const CURRENCIES = [
  { value: "USD", label: "USD (US Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "GBP", label: "GBP (British Pound)" },
  { value: "CAD", label: "CAD (Canadian Dollar)" },
  { value: "JPY", label: "JPY (Japanese Yen)" },
  { value: "AUD", label: "AUD (Australian Dollar)" },
];

export function StepPreferences({
  data,
  onChange,
  onNext,
  onBack,
}: StepPreferencesProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        <h2
          className="text-[28px] sm:text-[32px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Configure your preferences.
        </h2>
        <p className="text-[13.5px] text-[#8e93a6]">
          Tell OsterdOps how you want your workspace to behave.
        </p>
      </motion.div>

      {/* Cost Optimization Control */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4"
      >
        <div>
          <h4 className="text-[13.5px] font-semibold text-[#e8eaf0]">
            Cost Optimization
          </h4>
          <p className="text-[11.5px] text-[#7d8296] mt-0.5">
            How aggressive should we be with recommendations?
          </p>
        </div>

        {/* Interactive Custom Slider Line */}
        <div className="pt-4 pb-2 px-4 relative">
          <div className="w-full h-1 bg-[#1a1c28] rounded-full relative flex items-center justify-between">
            {/* Active connecting line fill */}
            <div
              className="absolute left-0 h-1 bg-[#dfba82] rounded-full transition-all duration-300"
              style={{
                width:
                  data.optimizationLevel === "Conservative"
                    ? "0%"
                    : data.optimizationLevel === "Balanced"
                    ? "50%"
                    : "100%",
              }}
            />

            {/* 3 Step Dots */}
            {OPTIMIZATION_LEVELS.map((lvl) => {
              const isActive = data.optimizationLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ optimizationLevel: lvl })}
                  className="relative z-10 focus:outline-none group cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-[#dfba82] border-white shadow-[0_0_12px_rgba(223,186,130,0.8)] scale-125"
                        : "bg-[#0d0f18] border-[#383d54] group-hover:border-[#dfba82]"
                    }`}
                  />
                  <span
                    className={`absolute top-6 left-1/2 -translate-x-1/2 text-[12px] font-medium transition-colors whitespace-nowrap ${
                      isActive ? "text-[#dfba82] font-semibold" : "text-[#787d91]"
                    }`}
                  >
                    {lvl}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-4" />
      </motion.div>

      {/* Grid: Notifications & Default Currency */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Notifications Toggle */}
        <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-3">
          <div>
            <h4 className="text-[13.5px] font-semibold text-[#e8eaf0]">
              Notifications
            </h4>
            <p className="text-[11.5px] text-[#7d8296] mt-0.5">
              How do you want to receive alerts and updates?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Email option */}
            <button
              type="button"
              onClick={() => onChange({ notificationPreference: "Email" })}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                data.notificationPreference === "Email"
                  ? "border-[#dfba82] bg-[#dfba82]/10 text-white font-semibold shadow-[0_0_15px_rgba(223,186,130,0.1)]"
                  : "border-[#1e2130] bg-[#121422] text-[#8e93a6] hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4 text-[#dfba82]" />
              <span className="text-[11.5px]">Email</span>
            </button>

            {/* Slack option */}
            <button
              type="button"
              onClick={() => onChange({ notificationPreference: "Slack" })}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                data.notificationPreference === "Slack"
                  ? "border-[#dfba82] bg-[#dfba82]/10 text-white font-semibold shadow-[0_0_15px_rgba(223,186,130,0.1)]"
                  : "border-[#1e2130] bg-[#121422] text-[#8e93a6] hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#dfba82]" />
              <span className="text-[11.5px]">Slack</span>
            </button>

            {/* Both option */}
            <button
              type="button"
              onClick={() => onChange({ notificationPreference: "Both" })}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                data.notificationPreference === "Both"
                  ? "border-[#dfba82] bg-[#dfba82]/10 text-white font-semibold shadow-[0_0_15px_rgba(223,186,130,0.1)]"
                  : "border-[#1e2130] bg-[#121422] text-[#8e93a6] hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4 text-[#dfba82]" />
              <span className="text-[11.5px]">Both</span>
            </button>
          </div>
        </div>

        {/* Default Currency */}
        <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-3">
          <div>
            <h4 className="text-[13.5px] font-semibold text-[#e8eaf0]">
              Default Currency
            </h4>
            <p className="text-[11.5px] text-[#7d8296] mt-0.5">
              Select your default currency
            </p>
          </div>

          <div className="relative pt-1">
            <select
              value={data.defaultCurrency}
              onChange={(e) => onChange({ defaultCurrency: e.target.value })}
              className="w-full bg-[#121422] border border-[#1e2130] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#dfba82]/20 transition-all appearance-none cursor-pointer"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value} className="bg-[#0d0f18] text-white">
                  {curr.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#787d91] absolute right-3.5 top-[calc(50%+2px)] -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#c5c9d6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(223,186,130,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
