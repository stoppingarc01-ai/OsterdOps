"use client";

import React from "react";
import { Cloud, Server, ShieldCheck, CheckCircle2, Lock, ArrowRight, Network } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section className="py-24 bg-[#080808] border-t border-[#161720] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Deployment Topologies: <span className="text-[#DFB277]">Cloud vs. VPC</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Deploy through our managed global Anycast edge or run self-hosted Docker and Kubernetes Helm charts inside your private air-gapped VPC.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Managed Global Edge Gateway */}
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] hover:border-[#DFB277]/40 transition-all space-y-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
                <Cloud className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-white">
                  Managed Global Edge Gateway
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-sans">
                  Turnkey global deployment with sub-15µs routing across 35 Anycast edge regions worldwide.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#161722]">
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
                  <span>Automated cross-provider failover &amp; model load balancing</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>99.99% edge uptime SLA guaranteed</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] text-[11px] font-mono text-neutral-400">
              Ideal for: AI startups &amp; high-velocity engineering fleets shipping fast with zero maintenance.
            </div>
          </div>

          {/* Card 2: Self-Hosted Docker / Kubernetes Helm Chart */}
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] hover:border-[#10B981]/40 transition-all space-y-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Server className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-white">
                  Self-Hosted VPC Data Plane
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-sans">
                  Air-gapped Kubernetes Helm chart &amp; Docker container running directly inside your AWS, Azure, or GCP VPC.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#161722]">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Prompts and API keys never leave your private VPC</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Air-gapped Kubernetes Helm chart &amp; multi-arch Docker image</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Direct internal network peering with AWS Bedrock &amp; Vertex AI</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Immediate enterprise compliance sign-off (HIPAA, SOC2, FedRAMP)</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] text-[11px] font-mono text-neutral-400">
              Ideal for: Regulated fintechs, healthcare enterprises, defense, and strict data sovereignty.
            </div>
          </div>
        </div>

        {/* Enterprise Compliance Strip */}
        <div className="pt-6 border-t border-[#161720] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-400">
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
