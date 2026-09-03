"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, BookOpen, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      slug: "cutting-frontier-llm-costs-by-70-percent",
      title: "Cutting Frontier LLM Spend by 70% With Automated Model Downgrades",
      desc: "How production AI engineering teams use budget ceiling triggers to route non-critical agent requests from GPT-4o to GPT-4o-mini without manual code redeployments.",
      date: "Aug 28, 2026",
      readTime: "6 min read",
      category: "FinOps Engineering",
      author: "OsterdOps Systems Team",
    },
    {
      slug: "benchmarking-sub-15us-wire-overhead",
      title: "Benchmarking Sub-15µs Wire Overhead in High-Throughput AI Gateways",
      desc: "A deep dive into our zero-disk in-memory routing architecture and how we achieve deterministic P95 latencies across 35 Anycast edge regions worldwide.",
      date: "Aug 15, 2026",
      readTime: "9 min read",
      category: "Architecture",
      author: "Core Gateway Team",
    },
    {
      slug: "stopping-runaway-agent-loops",
      title: "Preventing 5-Figure Cloud Bills: Stopping Runaway Agent Loops with RFC 7807",
      desc: "Autonomous AI agents can fire thousands of recursive calls in seconds when an exception occurs. Here is how our velocity circuit breaker protects your credit card.",
      date: "Jul 22, 2026",
      readTime: "5 min read",
      category: "Reliability",
      author: "FinOps Research",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#080808] font-sans relative overflow-x-clip">
      <Navbar />

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>OSTERDOPS ENGINEERING &amp; RESEARCH</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
              Gateway Architecture &amp; <span className="text-[#DFB277]">FinOps Insights</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Technical post-mortems, benchmarking reports, and best practices for building robust production AI fleets.
            </p>
          </div>

          {/* Posts Grid */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="p-6 sm:p-8 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] hover:border-[#DFB277]/40 transition-all space-y-4 group shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#161824] border border-[#232638] text-[#DFB277]">
                    {post.category}
                  </span>
                  <span>{post.date} • {post.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-sans text-white group-hover:text-[#DFB277] transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-sm text-neutral-400 font-sans leading-relaxed">
                  {post.desc}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">By {post.author}</span>
                  <Link
                    href="/developers/quickstart"
                    className="flex items-center gap-1.5 text-[#DFB277] font-semibold group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
