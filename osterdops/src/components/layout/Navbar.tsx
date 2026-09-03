"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OsterdOpsLogo } from "./OsterdOpsLogo";

interface NavItem {
  label: string;
  hasDropdown: boolean;
  href?: string;
  items?: { title: string; desc: string; badge?: string; href?: string }[];
}

const navLinks: NavItem[] = [
  {
    label: "Product",
    hasDropdown: true,
    href: "/#simulator",
    items: [
      { title: "Real-time AI Observability", desc: "Live spend, token rate, and P95 latency tracking", href: "/dashboard/analytics" },
      { title: "Smart Guardrails & FinOps", desc: "Proactive hard budgets & runaway loop breakers", href: "/dashboard/budgets" },
      { title: "Dynamic Routing & Fallbacks", desc: "Sub-15µs multi-provider automated failover", href: "/models" },
      { title: "Enterprise Zero-PII Egress", desc: "Inline SHA-256 telemetry & data perimeter", href: "/dashboard/security" },
    ],
  },
  {
    label: "Solutions",
    hasDropdown: true,
    href: "/#pricing",
    items: [
      { title: "For Engineering & Platform Teams", desc: "Unified LLM proxy & zero-maintenance gateway", href: "/developers" },
      { title: "For FinOps & Finance Leaders", desc: "Accurate cost attribution & department chargebacks", href: "/budgets" },
      { title: "For High-Growth AI Startups", desc: "Protect runway and prevent surprise token spikes", href: "/pricing" },
    ],
  },
  {
    label: "Resources",
    hasDropdown: true,
    href: "/blog",
    items: [
      { title: "Guides & Architecture", desc: "Production best practices for frontier LLM routing", href: "/blog" },
      { title: "Customer Case Studies", desc: "How top teams slash AI inferencing spend by 40%", href: "/reports" },
      { title: "API Reference & SDKs", desc: "OpenAI-compatible endpoints and client libraries", href: "/developers/api" },
    ],
  },
  {
    label: "Pricing",
    hasDropdown: true,
    href: "/pricing",
    items: [
      { title: "Developer Tier ($0/mo)", desc: "50k requests/mo, 100% free forever", badge: "Free", href: "/sign-up" },
      { title: "Growth & Team ($49/mo)", desc: "Unlimited models, custom alerts, & PII firewall", badge: "Popular", href: "/sign-up?plan=growth" },
      { title: "Scale Tier ($159/mo)", desc: "Multi-region anycast edge, semantic caching & failover", href: "/sign-up?plan=scale" },
      { title: "Enterprise Custom", desc: "VPC data plane, dedicated edge nodes, & 99.99% SLA", href: "/contact" },
    ],
  },
  {
    label: "Docs",
    hasDropdown: true,
    href: "/developers",
    items: [
      { title: "Quickstart Guide", desc: "Deploy your proxy perimeter in under 60 seconds", href: "/developers/quickstart" },
      { title: "Supported 64+ Models", desc: "OpenAI, Anthropic, Gemini, DeepSeek, Grok, Meta", href: "/models" },
      { title: "Pre-Flight Rules Engine", desc: "Configure velocity triggers and auto-downgrades", href: "/dashboard/automation" },
    ],
  },
  {
    label: "Changelog",
    hasDropdown: true,
    href: "/reports",
    items: [
      { title: "v2.4: DeepSeek-R1 & Grok-2 Support", desc: "Sub-8ms routing added for latest reasoning models", badge: "Latest", href: "/models" },
      { title: "v2.3: Zero-Egress In-Memory Sanitizer", desc: "Local regex and NER PII stripping engine", href: "/dashboard/security" },
      { title: "v2.2: Multi-Org Billing Hierarchies", desc: "Tag-based department budget caps and alerts", href: "/dashboard/billing" },
    ],
  },
];

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-[#080808]/90 backdrop-blur-md border-b border-[#1A1A1A]"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo + Subtext */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <OsterdOpsLogo size="md" subtitle="AI Gateway & FinOps" />
          </Link>
        </div>

        {/* Center navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
            >
              <Link
                href={link.href || "/"}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 rounded-lg ${
                  activeDropdown === link.label
                    ? "text-[#DFB277] bg-[#0D0D0D]"
                    : "text-neutral-400 hover:text-white hover:bg-[#0D0D0D]/60"
                }`}
              >
                <span>{link.label}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 opacity-60 ${
                    activeDropdown === link.label ? "rotate-180 text-[#DFB277]" : ""
                  }`}
                />
              </Link>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {link.hasDropdown && activeDropdown === link.label && link.items && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-1.5 w-72 p-2 rounded-xl bg-[#0D0D0D] border border-[#1A1A1A] shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50"
                  >
                    <div className="space-y-1">
                      {link.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href || link.href || "/"}
                          onClick={() => setActiveDropdown(null)}
                          className="block p-2.5 rounded-lg hover:bg-[#141414] transition-colors group/item"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-medium text-neutral-200 group-hover/item:text-[#DFB277] transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#DFB277]/15 text-[#DFB277] border border-[#DFB277]/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                            {item.desc}
                          </div>
                        </Link>
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
          {/* Ghost Log in button */}
          <Link
            href="/sign-in"
            className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Log in
          </Link>

          {/* Solid Champagne Gold CTA */}
          <Link
            href="/sign-up"
            className="group flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#080808] bg-[#DFB277] hover:bg-[#D4A362] rounded-lg transition-all duration-200 shadow-[0_2px_14px_rgba(223,178,119,0.25)] hover:shadow-[0_4px_20px_rgba(223,178,119,0.4)] hover:-translate-y-0.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
