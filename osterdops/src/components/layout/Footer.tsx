import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, ArrowRight } from "lucide-react";
import { OsterdOpsLogo } from "./OsterdOpsLogo";

export function Footer() {
  return (
    <footer className="bg-[#050609] border-t border-[#171a26] text-[#717684] text-[12px] py-14 px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3.5 pr-4">
            <div className="flex items-center gap-2.5">
              <OsterdOpsLogo size="md" />
            </div>
            <p className="text-[#7a7e92] text-[12px] leading-relaxed max-w-sm">
              The premier AI Cost Governance &amp; FinOps platform. Gain real-time visibility, proactive budget guardrails, and automated token optimization across all LLMs.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121622] border border-[#1d2232] text-[#22c55e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                All Systems Operational
              </span>
              <span className="text-[#4b5062]">•</span>
              <span className="text-[#8e94a8]">SOC 2 Type II Certified</span>
            </div>

            {/* Quick Admin Portal & Backend Onboard Button */}
            <div className="pt-2">
              <Link
                href="/admin"
                id="footer-admin-login-btn"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#dfba82]/10 hover:bg-[#dfba82]/20 border border-[#dfba82]/30 text-[#dfba82] hover:text-[#f4efe6] text-[12px] font-medium transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(223,186,130,0.15)] group"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#dfba82] group-hover:scale-110 transition-transform" />
                <span>Admin Login &bull; Direct Onboard</span>
                <ArrowRight className="h-3 w-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-[12px] tracking-wider uppercase">
              Product
            </div>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Cost Observability
                </Link>
              </li>
              <li>
                <Link href="/budgets" className="hover:text-white transition-colors">
                  Budget Guardrails
                </Link>
              </li>
              <li>
                <Link href="/optimization" className="hover:text-white transition-colors">
                  Smart Token Optimizer
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-white transition-colors">
                  Multi-Model Routing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-white transition-colors">
                  Provider Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-[12px] tracking-wider uppercase">
              Solutions
            </div>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Enterprise Platforms
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-white transition-colors">
                  FinOps &amp; Finance Teams
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-white transition-colors">
                  AI Startup Scaling
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Security &amp; Compliance
                </Link>
              </li>
              <li>
                <Link href="/billing" className="hover:text-white transition-colors">
                  ROI &amp; Spend Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers & Company Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-[12px] tracking-wider uppercase">
              Developers & Admin
            </div>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/onboarding" className="hover:text-[#dfba82] transition-colors font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-[#dfba82]" /> Admin Onboarding
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard Console
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  API Keys &amp; Gateway
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <a href="https://status.osterdops.com" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
                  System Status <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and social */}
        <div className="pt-8 border-t border-[#171a26] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555a6d]">
          <p>&copy; {new Date().getFullYear()} OsterdOps, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-[#dfba82]/80 hover:text-[#dfba82] transition-colors font-medium">
              Admin Login
            </Link>
            <a href="#" className="hover:text-[#9ca3af] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#9ca3af] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#9ca3af] transition-colors">
              Security Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
