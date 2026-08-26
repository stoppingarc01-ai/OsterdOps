"use client";

import React from "react";
import { ShieldCheck, Bell, Lock, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const guardrailFeatures = [
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Real-time alerts for budget overruns and anomalies.",
  },
  {
    icon: Lock,
    title: "Policy Enforcement",
    desc: "Enforce model usage, access, and spend limits.",
  },
  {
    icon: Users,
    title: "Cost Allocation",
    desc: "Allocate costs by team, project, and environment.",
  },
  {
    icon: TrendingUp,
    title: "Forecasting",
    desc: "AI-powered forecasts to plan and stay ahead.",
  },
];

export function GuardrailsBanner() {
  return (
    <div className="w-full pb-16 pt-2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-2xl bg-[#090b10]/90 border border-[#1e2230] p-6 sm:p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {/* Subtle gold glow line across top */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#dfba82]/30 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Header with Golden Shield */}
            <div className="lg:col-span-4 flex items-center gap-4 lg:pr-4 lg:border-r lg:border-[#1a1d29]">
              <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#dfba82]/15 to-transparent border border-[#dfba82]/40 shrink-0 shadow-[0_0_20px_rgba(223,186,130,0.15)]">
                <ShieldCheck className="h-7 w-7 text-[#dfba82]" />
              </div>
              <div>
                <h3
                  className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[#f4efe6] leading-snug"
                  style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                >
                  Guardrails that scale with you.
                </h3>
                <p className="text-[11.5px] leading-relaxed text-[#8b8fa3] mt-1">
                  Set budgets, enforce policies, and get alerted before AI costs spiral out of control.
                </p>
              </div>
            </div>

            {/* Right 4 Features */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {guardrailFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="flex flex-col gap-1.5 group">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#dfba82] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-[12.5px] font-semibold text-[#f4efe6] tracking-tight">
                        {feat.title}
                      </span>
                    </div>
                    <p className="text-[11px] leading-normal text-[#7b8094] group-hover:text-[#9da1b5] transition-colors">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
