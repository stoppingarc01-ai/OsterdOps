"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  KeyRound,
  FileCheck,
  ShieldAlert,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  Activity,
} from "lucide-react";

const complianceBadges = [
  { name: "SOC 2 Type II", status: "Verified" },
  { name: "ISO 27001", status: "Certified" },
  { name: "HIPAA Ready", status: "BAA Available" },
  { name: "Zero Data Retention", status: "Guaranteed" },
  { name: "GDPR & CCPA", status: "Compliant" },
  { name: "FIPS 140-2", status: "Enforced" },
];

const samplePayloads = [
  {
    label: "API Keys & Secrets",
    raw: 'curl -H "Authorization: sk-prod-9401f8a29b3c4d5e" -d \'{"prompt": "deploy db"}\'',
    redacted: 'curl -H "Authorization: [REDACTED_API_KEY]" -d \'{"prompt": "deploy db"}\'',
    type: "Credential Leak Prevention",
  },
  {
    label: "Customer PII & Emails",
    raw: '{"user": "sarah.connor@acme.corp", "ssn": "492-01-9842", "balance": 45000}',
    redacted: '{"user": "[MASKED_EMAIL]", "ssn": "[REDACTED_SSN]", "balance": 45000}',
    type: "PII Sanitization Rule",
  },
  {
    label: "Internal Source Code",
    raw: 'def connect_aws(): key = "AKIAIOSFODNN7EXAMPLE"; secret = "wJalrXUtnFEMI..."',
    redacted: 'def connect_aws(): key = "[REDACTED_AWS_KEY]"; secret = "[REDACTED_SECRET]"',
    type: "Code Exfiltration Guard",
  },
];

export function EnterpriseSecuritySection() {
  const [activePayload, setActivePayload] = useState(0);

  return (
    <section className="relative w-full bg-[#06070b] py-20 lg:py-28 border-t border-[#161a26] overflow-hidden">
      {/* Ambient background glow and grid */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#0284c7]/10 via-[#6366f1]/6 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0e1422] border border-[#1e2a44] text-[11px] font-semibold text-[#38bdf8] mb-4 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>ENTERPRISE-GRADE SECURITY &amp; COMPLIANCE</span>
          </div>

          <h2 className="text-[32px] sm:text-[42px] font-black leading-[1.08] tracking-tight text-white mb-4">
            Engineered for high-security enterprise environments
          </h2>

          <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#7e859b] max-w-2xl mx-auto">
            Never compromise compliance for AI acceleration. OsterdOps enforces strict zero-trust isolation, ephemeral processing, and verifiable governance at every layer.
          </p>
        </div>

        {/* Live Compliance Certification Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10">
          {complianceBadges.map((badge) => (
            <div
              key={badge.name}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#090c14] border border-[#1a2030] hover:border-[#2f3954] transition-all text-center group"
            >
              <span className="text-[12px] font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                {badge.name}
              </span>
              <span className="text-[10px] text-[#22c55e] flex items-center gap-1 mt-0.5 font-medium">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {badge.status}
              </span>
            </div>
          ))}
        </div>

        {/* Modern Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Bento Card 1: Interactive Real-Time PII & Secret Redactor (Spans 7 cols) */}
          <motion.div
            className="lg:col-span-7 rounded-2xl bg-[#0a0d17] border border-[#1c2336] p-6 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#0284c7]/15 border border-[#0284c7]/30 text-[#38bdf8]">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white leading-tight">
                      Automated Live PII &amp; Secret Redaction
                    </h3>
                    <p className="text-[11.5px] text-[#6b7280]">
                      Intercepts and masks confidential credentials before they hit external model providers.
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]">
                  &lt; 1ms latency
                </span>
              </div>

              {/* Interactive Payload Tabs */}
              <div className="flex items-center gap-1.5 mb-3">
                {samplePayloads.map((p, idx) => (
                  <button
                    key={p.label}
                    onClick={() => setActivePayload(idx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activePayload === idx
                        ? "bg-[#182136] text-white border border-[#2c3d64] shadow-xs"
                        : "text-[#6b7280] hover:text-[#c8cad4] hover:bg-white/[0.02]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Side-by-Side Visual Inspection Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                {/* Raw Input */}
                <div className="rounded-xl bg-[#06080e] border border-[#181f30] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-[#ef4444] mb-2 font-sans font-semibold">
                    <span>Raw Client Payload</span>
                    <span className="text-[9px] bg-[#ef4444]/10 px-1.5 py-0.2 rounded border border-[#ef4444]/20">Unsafe</span>
                  </div>
                  <p className="text-[#94a3b8] break-all leading-relaxed text-[10.5px]">
                    {samplePayloads[activePayload].raw}
                  </p>
                </div>

                {/* Sanitized Output */}
                <div className="rounded-xl bg-[#06080e] border border-[#22c55e]/30 p-3.5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] text-[#22c55e] mb-2 font-sans font-semibold">
                    <span>Forwarded to LLM</span>
                    <span className="text-[9px] bg-[#22c55e]/10 px-1.5 py-0.2 rounded border border-[#22c55e]/20">Sanitized</span>
                  </div>
                  <p className="text-white break-all leading-relaxed text-[10.5px]">
                    {samplePayloads[activePayload].redacted}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#161d2d] flex items-center justify-between text-[11px] text-[#6b7280]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#38bdf8]" />
                Enforces zero plaintext token leakage in training or log streams.
              </span>
              <span className="font-mono text-[#38bdf8] text-[10px]">Rule: {samplePayloads[activePayload].type}</span>
            </div>
          </motion.div>

          {/* Bento Card 2: Zero Data Retention (ZDR) Memory Scrub (Spans 5 cols) */}
          <motion.div
            className="lg:col-span-5 rounded-2xl bg-[#0a0d17] border border-[#1c2336] p-6 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#818cf8]">
                  <EyeOff className="h-4 w-4" />
                </div>
                <span className="text-[9.5px] font-bold text-[#818cf8] bg-[#6366f1]/10 px-2 py-0.5 rounded-full border border-[#6366f1]/20">
                  Zero Persistence
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-white mb-1.5">
                Zero Data Retention (ZDR) Engine
              </h3>
              <p className="text-[12px] text-[#788094] leading-relaxed mb-4">
                Your payload prompts, completions, and embedding vectors are never written to disk or used for training. Streamed strictly in volatile RAM.
              </p>

              {/* Diagram / Memory Scrub Pipeline */}
              <div className="rounded-xl bg-[#06080e] border border-[#181f30] p-3 space-y-2">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-[#94a3b8]">In-Memory Processing</span>
                  <span className="text-[#22c55e] font-mono font-semibold">100% Volatile</span>
                </div>
                <div className="h-1.5 bg-[#141926] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8] rounded-full w-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[9.5px] text-[#555e75]">
                  <span>Disk Storage: 0 Bytes</span>
                  <span>Payload Expiry: 0ms (Immediate)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#161d2d] flex items-center gap-1.5 text-[11px] text-[#6b7280]">
              <Lock className="h-3.5 w-3.5 text-[#818cf8]" />
              <span>Full compliance with strict EU Banking &amp; HIPAA ZDR standards.</span>
            </div>
          </motion.div>

          {/* Bento Card 3: Dedicated VPC & On-Prem Air-Gapped (Spans 4 cols) */}
          <motion.div
            className="lg:col-span-4 rounded-2xl bg-[#0a0d17] border border-[#1c2336] p-5 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#0ea5e9]/15 border border-[#0ea5e9]/30 text-[#38bdf8]">
                  <Server className="h-4 w-4" />
                </div>
                <span className="text-[9.5px] font-semibold text-[#38bdf8] bg-[#0ea5e9]/10 px-2 py-0.5 rounded-full border border-[#0ea5e9]/20">
                  Single Tenant
                </span>
              </div>

              <h3 className="text-[14px] font-bold text-white mb-1.5">
                Dedicated VPC &amp; On-Premises
              </h3>
              <p className="text-[11.5px] text-[#788094] leading-relaxed mb-3">
                Deploy OsterdOps within your private AWS, Azure, GCP VPCs or air-gapped data centers via Helm &amp; Terraform.
              </p>

              {/* Cloud Badge Pills */}
              <div className="flex flex-wrap gap-1.5">
                {["AWS PrivateLink", "Azure VNet", "GCP PSC", "Kubernetes"].map((c) => (
                  <span key={c} className="text-[9px] font-mono px-2 py-0.5 bg-[#121726] border border-[#1e273e] rounded text-[#9ca3af]">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#161d2d] flex items-center justify-between text-[11px] text-[#6b7280]">
              <span>Latency overhead</span>
              <span className="font-mono text-[#22c55e] font-semibold">&lt; 0.8ms VPC</span>
            </div>
          </motion.div>

          {/* Bento Card 4: Granular RBAC & SAML / SSO (Spans 4 cols) */}
          <motion.div
            className="lg:col-span-4 rounded-2xl bg-[#0a0d17] border border-[#1c2336] p-5 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/30 text-[#c084fc]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <span className="text-[9.5px] font-semibold text-[#c084fc] bg-[#a855f7]/10 px-2 py-0.5 rounded-full border border-[#a855f7]/20">
                  SCIM 2.0
                </span>
              </div>

              <h3 className="text-[14px] font-bold text-white mb-1.5">
                Granular RBAC &amp; SAML 2.0 SSO
              </h3>
              <p className="text-[11.5px] text-[#788094] leading-relaxed mb-3">
                Enforce least-privilege key access, budget modification approvals, and automatic deprovisioning via Okta or Azure AD.
              </p>

              {/* Roles matrix */}
              <div className="flex flex-wrap gap-1.5">
                {["FinOps Lead", "Platform Eng", "SecOps Auditor", "App Developer"].map((r) => (
                  <span key={r} className="text-[9px] font-mono px-2 py-0.5 bg-[#121726] border border-[#1e273e] rounded text-[#9ca3af]">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#161d2d] flex items-center justify-between text-[11px] text-[#6b7280]">
              <span>Auth Providers</span>
              <span className="text-white font-medium">Okta, Azure, Google</span>
            </div>
          </motion.div>

          {/* Bento Card 5: Cryptographic Audit Logs & SIEM Export (Spans 4 cols) */}
          <motion.div
            className="lg:col-span-4 rounded-2xl bg-[#0a0d17] border border-[#1c2336] p-5 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#4ade80]">
                  <FileCheck className="h-4 w-4" />
                </div>
                <span className="text-[9.5px] font-semibold text-[#4ade80] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">
                  Tamper-Proof
                </span>
              </div>

              <h3 className="text-[14px] font-bold text-white mb-1.5">
                Immutable SIEM Audit Logs
              </h3>
              <p className="text-[11.5px] text-[#788094] leading-relaxed mb-3">
                Stream cryptographic audit records, spending attribution, and policy triggers directly to Splunk, Datadog, or S3.
              </p>

              {/* SIEM Targets */}
              <div className="flex flex-wrap gap-1.5">
                {["Splunk", "Datadog", "AWS S3", "Elasticsearch"].map((s) => (
                  <span key={s} className="text-[9px] font-mono px-2 py-0.5 bg-[#121726] border border-[#1e273e] rounded text-[#9ca3af]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#161d2d] flex items-center justify-between text-[11px] text-[#6b7280]">
              <span>Hash Verification</span>
              <span className="font-mono text-[#22c55e]">SHA-256 HMAC</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
