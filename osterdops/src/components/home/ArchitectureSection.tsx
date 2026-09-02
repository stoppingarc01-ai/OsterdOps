"use client";

import React from "react";
import { Cloud, Server, ShieldCheck, CheckCircle2, Lock, ArrowRight, Network } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section className="py-20 bg-[#0A0A0A] border-y border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            Deployment
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cloud or Private VPC
          </h2>

          <p className="text-sm text-neutral-400">
            Deploy through our globally distributed edge or run self-hosted containers inside your AWS, GCP, or Azure VPC.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: OsterdOps Cloud Edge */}
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#DFB277]/40 transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
                <Cloud className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-white">
                  OsterdOps Managed Cloud Edge
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Turnkey global deployment with sub-5ms routing across 35 edge regions worldwide.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#161616]">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>35+ Global Anycast edge locations</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Zero infrastructure management or DevOps overhead</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Automated multi-region failover &amp; provider load balancing</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>99.99% edge uptime SLA guaranteed</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080808] border border-[#161616] text-[11px] font-mono text-neutral-400">
              Ideal for: Startups &amp; high-growth teams shipping fast with zero infra maintenance.
            </div>
          </div>

          {/* Card 2: VPC Self-Hosted Data Plane */}
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#10B981]/40 transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Server className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-white">
                  VPC Self-Hosted Data Plane
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  100% data sovereign container running directly inside your AWS, Azure, or GCP cluster.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#161616]">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Prompts and API keys never leave your cloud perimeter</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Air-gapped Kubernetes Helm chart &amp; Docker images</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Direct internal network peering with Bedrock / Vertex AI</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Immediate compliance sign-off (HIPAA, SOC2, FedRAMP)</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080808] border border-[#161616] text-[11px] font-mono text-neutral-400">
              Ideal for: Regulated fintechs, healthcare enterprises, and strict security compliance.
            </div>
          </div>
        </div>

        {/* Enterprise Compliance Strip */}
        <div className="pt-6 border-t border-[#1A1A1A] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
            SOC2 Type II Certified
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            HIPAA BAA Available
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            GDPR &amp; CCPA Compliant
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
            ISO 27001 Certified
          </span>
        </div>
      </div>
    </section>
  );
}
