"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  DollarSign,
  Globe,
  Lock,
  Zap,
} from "lucide-react";

const stats = [
  { icon: Shield, value: "99.9%", label: "Uptime SLA" },
  { icon: Users, value: "10K+", label: "Engineers & Teams" },
  { icon: DollarSign, value: "$250M+", label: "Spend Managed" },
  { icon: Globe, value: "50+", label: "Countries" },
  { icon: Lock, value: "Enterprise", label: "Grade Security" },
  { icon: Zap, value: "< 100ms", label: "Proxy Latency" },
];

export function StatsBar() {
  return (
    <section className="relative w-full bg-[#0b0c12] border-t border-[#1a1d2a]">
      <div className="mx-auto max-w-7xl px-6 py-7">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#14161f] border border-[#1e2130]">
                  <Icon className="h-4.5 w-4.5 text-[#565b72]" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-white leading-tight">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-[#565b72] leading-tight">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
