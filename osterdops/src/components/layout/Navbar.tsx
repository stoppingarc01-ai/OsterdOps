"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OsterdOpsLogo } from "./OsterdOpsLogo";
import { useThemeCustomizer } from "@/context/ThemeCustomizerContext";

const navLinks = [
  {
    label: "Product",
    hasDropdown: true,
    items: [
      { title: "Real-time Observability", desc: "Live spend and latency tracking" },
      { title: "Smart Guardrails", desc: "Proactive budget & rate limits" },
      { title: "AI Routing & Optimization", desc: "Intelligent model fallback & caching" },
      { title: "Enterprise Governance", desc: "Granular RBAC and SOC2 audit logs" },
    ],
  },
  {
    label: "Solutions",
    hasDropdown: true,
    items: [
      { title: "For Engineering Teams", desc: "Unified LLM gateway & debugging" },
      { title: "For FinOps & Finance", desc: "Accurate cost allocation & forecasting" },
      { title: "For AI Startups", desc: "Scale without runway surprises" },
    ],
  },
  { label: "Integrations", hasDropdown: false, href: "#integrations" },
  { label: "Pricing", hasDropdown: false, href: "#pricing" },
  { label: "Docs", hasDropdown: false, href: "#docs" },
  {
    label: "Resources",
    hasDropdown: true,
    items: [
      { title: "Blog & Guides", desc: "Best practices for LLM cost management" },
      { title: "Customer Stories", desc: "How top teams save 30%+ on AI spend" },
      { title: "API Reference", desc: "REST & SDK integration docs" },
    ],
  },
];

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { accent, setIsModalOpen } = useThemeCustomizer();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-[#06070b]/90 backdrop-blur-md border-b border-[#181a24]"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <OsterdOpsLogo size="md" />
        </a>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
            >
              <a
                href={link.href || "#"}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200 rounded-lg ${
                  activeDropdown === link.label
                    ? "text-[#dfba82] bg-white/[0.04]"
                    : "text-[#9da1b2] hover:text-[#f4efe6] hover:bg-white/[0.03]"
                }`}
              >
                {link.label}
                {link.hasDropdown && (
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 opacity-60 ${
                      activeDropdown === link.label ? "rotate-180 text-[#dfba82]" : ""
                    }`}
                  />
                )}
              </a>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {link.hasDropdown && activeDropdown === link.label && link.items && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-1.5 w-64 p-2 rounded-xl bg-[#0c0e16] border border-[#212435] shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50"
                  >
                    <div className="space-y-1">
                      {link.items.map((item) => (
                        <a
                          key={item.title}
                          href="#"
                          className="block p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors group/item"
                        >
                          <div className="text-[12.5px] font-medium text-[#e4e0d8] group-hover/item:text-[#dfba82]">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#717688] mt-0.5">
                            {item.desc}
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Sign in text */}
          <Link
            href="/sign-in"
            className="px-3.5 py-1.5 text-[13.5px] font-medium text-[#c5c8d4] hover:text-[#f4efe6] transition-colors"
          >
            Sign in
          </Link>

          {/* Get Started Button */}
          <Link
            href="/sign-up"
            className="group flex items-center gap-1.5 px-4 py-2 text-[13.5px] font-semibold text-[#090a0f] bg-[#f2e7d3] hover:bg-[#faeedb] rounded-lg transition-all duration-200 shadow-[0_2px_12px_rgba(223,186,130,0.2)] hover:shadow-[0_4px_18px_rgba(223,186,130,0.35)] hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
