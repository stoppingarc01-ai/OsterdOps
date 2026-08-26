import React from "react";
import { ArrowUpRight } from "lucide-react";
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
            <div className="flex items-center gap-3 text-[11px] font-medium pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121622] border border-[#1d2232] text-[#22c55e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                All Systems Operational
              </span>
              <span className="text-[#4b5062]">•</span>
              <span className="text-[#8e94a8]">SOC 2 Type II Certified</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-[12px] tracking-wider uppercase">
              Product
            </div>
            <ul className="space-y-2 text-[12px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cost Observability
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Budget Guardrails
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Smart Token Optimizer
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Universal Proxy SDK
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Multi-Model Routing
                </a>
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
                <a href="#" className="hover:text-white transition-colors">
                  Enterprise Platforms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FinOps &amp; Finance Teams
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  AI Startup Scaling
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security &amp; Compliance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  ROI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Developers & Company Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-[12px] tracking-wider uppercase">
              Developers
            </div>
            <ul className="space-y-2 text-[12px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  SDK Packages
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
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
