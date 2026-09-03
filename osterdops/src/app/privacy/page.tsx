"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, ArrowLeft, Lock, CheckCircle2, EyeOff } from "lucide-react";

export default function PrivacyPage() {
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-mono font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>DATA PROTECTION // PRIVACY POLICY &amp; ZERO-EGRESS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Privacy Policy &amp; <span className="text-[#DFB277]">Data Perimeter</span>
            </h1>

            <p className="text-xs font-mono text-neutral-500">
              Effective Date: January 1, 2026 • SOC2 Type II &amp; HIPAA BAA Compliant
            </p>
          </div>

          <div className="rounded-2xl bg-[#0D0E14] border border-[#1A1C28] p-6 sm:p-10 space-y-6 text-sm text-neutral-300 font-sans leading-relaxed shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-200 leading-relaxed font-sans">
                <strong className="text-white">Zero Data Retention (ZDR) Guarantee:</strong> OsterdOps does not train foundation AI models on your inputs, prompts, completions, embeddings, or metadata. Prompts are sanitized in-memory and immediately forwarded.
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">1. Information We Collect</h2>
              <p>
                To provide gateway routing and FinOps analytics, we collect operational telemetry metadata: HTTP request timestamp, model slug, token usage counts, response latency (ms), and cost estimations. We do not inspect payload bodies unless client-side PII redaction rules are explicitly turned on.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">2. In-Memory PII &amp; Secret Sanitization</h2>
              <p>
                When our inline PII Sanitizer is enabled, social security numbers, credit card numbers, email addresses, and API bearer keys are stripped using deterministic compiled regex engines before the packet leaves our network edge towards the target provider.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">3. Cryptographic Key Storage</h2>
              <p>
                All BYOK provider secrets are encrypted using envelope encryption with per-tenant keys managed via hardware security modules (HSM) and AES-256-GCM. Plaintext keys are never logged.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-white">4. GDPR, CCPA &amp; HIPAA Compliance</h2>
              <p>
                Customers subject to HIPAA can execute a Business Associate Agreement (BAA). We provide self-serve data deletion and data export requests in accordance with GDPR Article 17 and CCPA regulations.
              </p>
            </section>

            <div className="pt-4 border-t border-[#181A26] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Privacy Officer: privacy@osterdops.com</span>
              <Link href="/terms" className="text-[#DFB277] hover:underline">
                View Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
