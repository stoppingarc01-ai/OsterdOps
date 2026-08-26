"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Link2,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Real-time Visibility",
    description:
      "Track spend, tokens, requests, latency, and model usage in real time across all projects.",
  },
  {
    icon: ShieldCheck,
    title: "Smart Guardrails",
    description:
      "Set budgets and thresholds to prevent runaway spend before it happens.",
  },
  {
    icon: Zap,
    title: "Intelligent Optimization",
    description:
      "AI-powered recommendations to route, downgrade, or refactor for maximum savings.",
  },
  {
    icon: AlertTriangle,
    title: "Proactive Alerts",
    description:
      "Instant alerts on budget breaches, anomalies, and unusual usage patterns.",
  },
  {
    icon: Link2,
    title: "Unified Integrations",
    description:
      "Connect and manage multiple AI providers through a single secure proxy.",
  },
  {
    icon: BarChart3,
    title: "Advanced Reporting",
    description:
      "Custom reports and exports for engineering, finance, and executive teams.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function FeatureCards() {
  return (
    <section className="relative w-full bg-[#08090e] py-4 lg:py-6">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={item}
                className="group bg-[#0e1017] border border-[#1e2130] rounded-xl p-5 transition-all duration-300 hover:border-[#2a2d3e] hover:bg-[#111318]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">
                    {f.title}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-[#7a7e94]">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
