"use client";

import React, { useState } from "react";
import { ArrowRight, Building2, Cpu, Sliders, Users, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../types";

interface StepReviewFinishProps {
  data: OnboardingData;
  onFinish: () => void;
  onReviewSettings: () => void;
}

export function StepReviewFinish({
  data,
  onFinish,
  onReviewSettings,
}: StepReviewFinishProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleEnterWorkspace = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      onFinish();
    }, 1200);
  };

  // Map provider IDs to readable names
  const providerNamesMap: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Google Gemini",
    azure: "Azure OpenAI",
    aws: "AWS Bedrock",
    other: "Custom Gateway",
  };

  const connectedNames = data.connectedProviders.map(
    (id) => providerNamesMap[id] || id
  );

  const displayProvidersText =
    connectedNames.length > 0
      ? connectedNames.slice(0, 4).join(", ") +
        (connectedNames.length > 4
          ? ` + ${connectedNames.length - 4} more integrations`
          : "")
      : "No integrations connected yet";

  // Team summary calculation
  const roleCounts = data.teamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleBreakdownText = Object.entries(roleCounts)
    .map(([role, count]) => `${count} ${role}`)
    .join(" · ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
      {/* Left Column: Summary Info & Actions */}
      <div className="lg:col-span-7 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dfba82]/15 border border-[#dfba82]/30 text-[#dfba82] text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Ready to Launch</span>
          </div>
          <h2
            className="text-[28px] sm:text-[34px] font-medium tracking-tight text-[#f4efe6]"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            Your workspace is ready.
          </h2>
          <p className="text-[13.5px] text-[#8e93a6]">
            Review your configuration before entering OsterdOps.
          </p>
        </motion.div>

        {/* Configuration Review Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0d0f18] border border-[#1d202e] rounded-2xl p-5 space-y-4"
        >
          {/* Section 1: Organization */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#73788c]">
                Organization
              </div>
              <div className="text-[13.5px] font-bold text-white mt-0.5">
                {data.orgName || "Untitled Organization"}
              </div>
              <div className="text-[12px] text-[#8e93a6] mt-0.5">
                {data.industry} · {data.companySize} · {data.country}
              </div>
            </div>
          </div>

          <div className="border-t border-[#171a27]" />

          {/* Section 2: AI Providers */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#73788c]">
                AI Providers
              </div>
              <div className="text-[12.5px] font-medium text-[#e8eaf0] mt-0.5">
                {displayProvidersText}
              </div>
            </div>
          </div>

          <div className="border-t border-[#171a27]" />

          {/* Section 3: Preferences */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#73788c]">
                Preferences
              </div>
              <div className="text-[12.5px] font-medium text-[#e8eaf0] mt-0.5">
                Optimization: <span className="text-white font-semibold">{data.optimizationLevel}</span> · Notifications: <span className="text-white font-semibold">{data.notificationPreference}</span> · Currency: <span className="text-white font-semibold">{data.defaultCurrency}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#171a27]" />

          {/* Section 4: Team */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#73788c]">
                Team
              </div>
              <div className="text-[13px] font-bold text-white mt-0.5">
                {data.teamMembers.length} members invited
              </div>
              <div className="text-[11.5px] text-[#8e93a6] mt-0.5">
                {roleBreakdownText}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            type="button"
            onClick={handleEnterWorkspace}
            disabled={isRedirecting}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(223,186,130,0.35)] hover:shadow-[0_6px_25px_rgba(223,186,130,0.5)] transition-all cursor-pointer hover:-translate-y-0.5 disabled:opacity-80"
          >
            <span>{isRedirecting ? "Initializing Workspace..." : "Enter OsterdOps"}</span>
            {!isRedirecting && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </button>

          <button
            type="button"
            onClick={onReviewSettings}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#8e93a6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer text-center"
          >
            Review settings
          </button>
        </motion.div>
      </div>

      {/* Right Column: 3D Golden Obsidian Cube Nucleus Animation */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[340px]">
        <div className="absolute w-72 h-72 bg-[#dfba82]/[0.1] rounded-full blur-[90px] pointer-events-none" />

        {/* Concentric Rotating Orbital Rings */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-[#dfba82]/30 shadow-[0_0_20px_rgba(223,186,130,0.1)]"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-dashed border-[#dfba82]/40"
          />

          {/* 3D Glowing Obsidian Cube Stack */}
          <motion.div
            animate={{ y: [0, -10, 0], rotateY: [0, 180, 360] }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
            }}
            className="w-28 h-28 relative flex items-center justify-center"
          >
            {/* Isometric Cube Shape */}
            <div className="w-20 h-20 bg-gradient-to-tr from-[#121422] to-[#202438] border-2 border-[#dfba82] rounded-xl transform rotate-45 flex items-center justify-center shadow-[0_0_35px_rgba(223,186,130,0.3)]">
              <div className="w-10 h-10 border border-[#dfba82]/60 rounded-lg transform -rotate-45 flex items-center justify-center bg-[#dfba82]/10">
                <CheckCircle2 className="w-6 h-6 text-[#dfba82]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
