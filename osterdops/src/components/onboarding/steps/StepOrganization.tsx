"use client";

import React from "react";
import { ArrowRight, ArrowLeft, Shield, Globe, Building2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../types";

interface StepOrganizationProps {
  data: OnboardingData;
  onChange: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const INDUSTRIES = [
  "Technology",
  "Financial Services & Banking",
  "Healthcare & Life Sciences",
  "E-Commerce & Retail",
  "AI & Machine Learning",
  "Enterprise Software & SaaS",
  "Consulting & Professional Services",
];

const COMPANY_SIZES = [
  "1 – 10 employees",
  "11 – 50 employees",
  "51 – 200 employees",
  "201 – 500 employees",
  "500+ employees",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Japan",
  "Singapore",
  "Global / Remote",
];

export function StepOrganization({
  data,
  onChange,
  onNext,
  onBack,
}: StepOrganizationProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
      {/* Left Column: Form Controls */}
      <div className="lg:col-span-7 space-y-6">
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
            Tell us about your organization.
          </h2>
          <p className="text-[13.5px] text-[#8e93a6]">
            This helps us configure OsterdOps for your team.
          </p>
        </motion.div>

        {/* Input Fields */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Organization Name */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-[#c5c9d6]">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={data.orgName}
              onChange={(e) => onChange({ orgName: e.target.value })}
              placeholder="e.g. Acme AI or Global Tech"
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-[#52576b] focus:outline-none focus:ring-2 focus:ring-[#dfba82]/20 transition-all"
            />
          </div>

          {/* Industry Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-[#c5c9d6]">
              Industry
            </label>
            <div className="relative">
              <select
                value={data.industry}
                onChange={(e) => onChange({ industry: e.target.value })}
                className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-[13.5px] text-white focus:outline-none focus:ring-2 focus:ring-[#dfba82]/20 transition-all appearance-none cursor-pointer"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-[#0d0f18] text-white">
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#787d91] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2-Column Grid: Company Size & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-[#c5c9d6]">
                Company Size
              </label>
              <div className="relative">
                <select
                  value={data.companySize}
                  onChange={(e) => onChange({ companySize: e.target.value })}
                  className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-[13.5px] text-white focus:outline-none focus:ring-2 focus:ring-[#dfba82]/20 transition-all appearance-none cursor-pointer"
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size} className="bg-[#0d0f18] text-white">
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#787d91] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Country / Region */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-[#c5c9d6]">
                Country / Region
              </label>
              <div className="relative">
                <select
                  value={data.country}
                  onChange={(e) => onChange({ country: e.target.value })}
                  className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-[13.5px] text-white focus:outline-none focus:ring-2 focus:ring-[#dfba82]/20 transition-all appearance-none cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0d0f18] text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#787d91] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-4 bg-[#0c0e16] border border-[#1b1e2e] rounded-2xl flex items-start gap-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[12.5px] font-semibold text-[#e8eaf0]">Your data stays protected.</h5>
            <p className="text-[11.5px] text-[#7d8296] leading-relaxed mt-0.5">
              OsterdOps uses secure infrastructure designed for enterprise environments.
            </p>
          </div>
        </motion.div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#c5c9d6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(223,186,130,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Column: 3D Golden Wireframe Globe Animation */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[320px]">
        <div className="absolute w-64 h-64 bg-[#dfba82]/[0.08] rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="relative w-64 h-64 flex items-center justify-center"
        >
          {/* Outer Orbital Rings */}
          <div className="absolute inset-0 rounded-full border border-[#dfba82]/30 animate-pulse" />
          <div className="absolute inset-3 rounded-full border border-[#dfba82]/15 transform rotate-45" />
          <div className="absolute inset-6 rounded-full border border-dashed border-[#dfba82]/25 transform -rotate-45" />

          {/* Central Wireframe Sphere */}
          <div className="w-44 h-44 rounded-full border-2 border-[#dfba82]/40 bg-gradient-to-b from-[#dfba82]/10 to-transparent relative flex items-center justify-center shadow-[0_0_40px_rgba(223,186,130,0.15)]">
            <Globe className="w-24 h-24 text-[#dfba82]/60 stroke-[1]" />
            
            {/* Orbiting Satellite Node Dots */}
            <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-[#dfba82] shadow-[0_0_8px_#dfba82]" />
            <div className="absolute bottom-4 right-8 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-[#dfba82]" />
          </div>
        </motion.div>
      </div>
    </form>
  );
}
