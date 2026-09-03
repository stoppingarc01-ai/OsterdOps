"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  Mail,
  Building2,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageSquare,
  Server,
  Zap,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "10-50",
    monthlyVolume: "1M-10M requests",
    deploymentInterest: "Managed Cloud Anycast",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#080808] font-sans relative overflow-x-clip">
      <Navbar />

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>ENTERPRISE &amp; SOLUTIONS ARCHITECTURE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
              Talk to an AI Solutions <span className="text-[#DFB277]">Architect</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Whether you need private VPC Helm deployment, custom FinOps guardrail policies, or high-throughput volume pricing, our systems engineers are standing by.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in-50 duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl font-bold font-sans text-white">Inquiry Received</h2>
                  <p className="text-sm text-neutral-400 max-w-md mx-auto font-sans">
                    Thank you, <span className="text-white font-semibold">{formData.name}</span>. A dedicated OsterdOps Solutions Architect will review your specs and email you at <span className="text-[#DFB277] font-mono">{formData.email}</span> within 2 business hours.
                  </p>
                  <div className="pt-4">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs font-mono transition-all"
                    >
                      <span>Return to Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-300">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Satya Nadella"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-300">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@enterprise.corp"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-300">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Autonomous AI"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-300">Expected Monthly Volume</label>
                      <select
                        value={formData.monthlyVolume}
                        onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none transition-colors"
                      >
                        <option value="1M-10M requests">1M – 10M requests / month</option>
                        <option value="10M-50M requests">10M – 50M requests / month</option>
                        <option value="50M+ requests">50M+ requests / month (Enterprise)</option>
                        <option value="Custom Air-Gapped">Air-Gapped VPC Pooling</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-300">Deployment Topology Preference</label>
                    <select
                      value={formData.deploymentInterest}
                      onChange={(e) => setFormData({ ...formData, deploymentInterest: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none transition-colors"
                    >
                      <option value="Managed Cloud Anycast">Managed Global Anycast Edge (SaaS)</option>
                      <option value="Self-Hosted Kubernetes Helm">Self-Hosted Kubernetes Helm Chart (Private VPC)</option>
                      <option value="Docker Air-Gapped">Docker Air-Gapped On-Premises</option>
                      <option value="Hybrid">Hybrid Multi-Region Peering</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-300">Project Requirements &amp; Timeline</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your AI stack, current inference providers, budget constraints, or compliance needs (SOC2, HIPAA, FedRAMP)..."
                      className="w-full p-3 rounded-xl bg-[#08080B] border border-[#1E2130] focus:border-[#DFB277] text-white text-xs font-sans outline-none resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs font-mono transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(223,178,119,0.3)]"
                  >
                    <span>Submit Architecture Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Trust Proofs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] space-y-4">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#DFB277]" />
                  <span>Enterprise SLA Guarantees</span>
                </h3>

                <div className="space-y-3 text-xs text-neutral-300 font-sans">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong className="text-white">99.99% Financially Backed SLA:</strong> Anycast edge with automatic multi-cloud provider failover.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong className="text-white">Zero Disk Persistence:</strong> Wire-speed proxying with in-memory PII scrubbing and zero prompt retention.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong className="text-white">Dedicated Slack Channel:</strong> 15-minute response times with our core platform engineering team.</span>
                  </div>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] space-y-3 font-mono text-xs text-neutral-400">
                <div className="text-neutral-500 uppercase tracking-wider text-[11px] font-bold">
                  Direct Inquiries
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Mail className="w-4 h-4 text-[#DFB277]" />
                  <a href="mailto:solutions@osterdops.com" className="hover:underline">solutions@osterdops.com</a>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Server className="w-4 h-4 text-[#10B981]" />
                  <span>Anycast Wire: gateway.osterdops.com</span>
                </div>
                <div className="pt-2 border-t border-[#181A26] flex items-center gap-2 text-[#10B981]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SOC2 Type II &amp; HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
