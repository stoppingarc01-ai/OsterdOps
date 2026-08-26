"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";
import { TrustedBySection } from "./TrustedBySection";
import { GuardrailsBanner } from "./GuardrailsBanner";

const featureHighlights = [
  { icon: Eye, label: "Real-time visibility" },
  { icon: ShieldCheck, label: "Multi-provider support" },
  { icon: Lock, label: "Budget guardrails" },
];

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#06070b]">
      {/* Background ambient lighting effects matching screenshot */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft warm gold ambient glow at the top-left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#dfba82]/[0.04] blur-[120px]" />
        {/* Deep subtle blue radial glow behind dashboard */}
        <div className="absolute top-20 right-10 w-[700px] h-[700px] rounded-full bg-[#1e293b]/[0.15] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-12 lg:pt-16 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Subtitle, CTAs, Feature Row */}
          <motion.div
            className="lg:col-span-5 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Gold Outlined Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dfba82]/[0.06] border border-[#dfba82]/30 text-[10px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#dfba82] mb-6 w-fit backdrop-blur-sm shadow-[0_0_15px_rgba(223,186,130,0.08)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dfba82] shadow-[0_0_8px_#dfba82]" />
              AI COST GOVERNANCE &amp; OPERATIONS
            </div>

            {/* Editorial Luxury Serif Heading */}
            <h1
              className="text-[42px] sm:text-[52px] lg:text-[58px] xl:text-[64px] font-medium leading-[1.05] tracking-tight text-[#f4efe6] mb-5"
              style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
            >
              Control. Optimize.
              <br />
              Scale AI with
              <br />
              <span className="text-[#dfba82]">Confidence.</span>
            </h1>

            {/* Subtext */}
            <p className="text-[14.5px] sm:text-[15.5px] leading-[1.65] text-[#9397aa] max-w-[460px] mb-8 font-sans">
              OsterdOps gives engineering and finance teams complete visibility and control over AI spend across all models, providers, and projects.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              {/* Primary Champagne Button */}
              <button className="group flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#f2e7d3] hover:bg-[#faeedb] text-[#090a0f] text-[13.5px] sm:text-[14px] font-semibold rounded-xl shadow-[0_4px_20px_rgba(223,186,130,0.22)] hover:shadow-[0_6px_25px_rgba(223,186,130,0.38)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary Dark Button */}
              <button className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#0d0f16]/90 hover:bg-[#151722] text-[#d5cabe] hover:text-[#f4efe6] text-[13.5px] sm:text-[14px] font-medium border border-[#262420] hover:border-[#3d3830] rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                Explore Product
              </button>
            </div>

            {/* Feature Highlights beneath CTAs */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2 border-t border-[#171924]">
              {featureHighlights.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#dfba82] shrink-0" />
                    <span className="text-[12px] font-medium text-[#c5c8d6]">
                      {feat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Dashboard Mockup */}
          <motion.div
            className="lg:col-span-7 flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <div className="w-full max-w-[780px]">
              <DashboardMockup />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trusted By Innovative Teams */}
      <TrustedBySection />

      {/* Guardrails That Scale With You Banner */}
      <GuardrailsBanner />
    </section>
  );
}
