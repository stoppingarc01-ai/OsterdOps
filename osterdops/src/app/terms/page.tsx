"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, ArrowLeft, FileText, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#080808] font-sans relative overflow-x-clip">
      <Navbar />

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#DFB277] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Gateway</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>LEGAL COMPLIANCE // TERMS OF SERVICE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Terms of <span className="text-[#DFB277]">Service</span>
            </h1>

            <p className="text-xs font-mono text-neutral-500">
              Effective Date: January 1, 2026 • Version 2.4 (Enterprise Ready)
            </p>
          </div>

          <div className="rounded-2xl bg-[#0D0E14] border border-[#1A1C28] p-6 sm:p-10 space-y-6 text-sm text-neutral-300 font-sans leading-relaxed shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">1. Master Service Agreement Overview</h2>
              <p>
                These Terms of Service govern your access to and use of the OsterdOps AI Gateway, FinOps control plane, SDK proxies, and management APIs operated by OsterdOps, Inc. By creating an account or pointing API traffic to <code className="text-[#DFB277] font-mono">gateway.osterdops.com</code>, you agree to be bound by these Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">2. Data Plane &amp; Zero-Disk Retention Policy</h2>
              <p>
                OsterdOps operates as an active in-memory network proxy. We do not persist raw user prompt payloads or model completion responses to persistent storage disks unless you explicitly configure long-term audit logging in your workspace governance settings. Telemetry is evaluated strictly in volatile RAM (&lt;15µs).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">3. Upstream Provider Pass-Through &amp; BYOK</h2>
              <p>
                When using Bring-Your-Own-Key (BYOK) mode, customer credentials remain AES-256-GCM encrypted. Downstream inferencing billing fees are determined by respective upstream foundation model providers (OpenAI, Anthropic, Google, DeepSeek, xAI, Groq, Meta).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">4. Availability, Service Level Agreements (SLAs) &amp; Failover</h2>
              <p>
                Paid tiers (Growth, Scale, Enterprise) include uptime guarantees ranging from 99.9% to 99.99% edge availability. In the event of an upstream provider service degradation or rate limit (HTTP 429 / 503), OsterdOps triggers automated failover routing pursuant to your configured policy matrix.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">5. Acceptable Use &amp; Autonomous Agent Controls</h2>
              <p>
                Customers are responsible for ensuring that automated agent workloads obey rate limit ceilings. OsterdOps reserves the right to trigger automatic velocity circuit breakers if recursive loops threaten platform stability.
              </p>
            </section>

            <div className="pt-4 border-t border-[#181A26] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Questions? Contact legal@osterdops.com</span>
              <Link href="/privacy" className="text-[#DFB277] hover:underline">
                View Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
