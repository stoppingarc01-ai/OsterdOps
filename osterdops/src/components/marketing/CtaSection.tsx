"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative w-full bg-[#08090e] py-16 lg:py-24 border-t border-[#1a1d2a] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#38bdf8]/10 via-[#6366f1]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-[#0c0e16] border border-[#1e2334] p-8 sm:p-14 shadow-[0_20px_70px_rgba(0,0,0,0.85)] relative overflow-hidden"
        >
          {/* Subtle top pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151928] border border-[#232a42] text-[11px] font-semibold text-[#38bdf8] mb-5">
            <Sparkles className="h-3 w-3" />
            <span>Start Free in 5 Minutes</span>
          </div>

          <h2 className="text-[32px] sm:text-[44px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Take total control of your AI costs today.
          </h2>

          <p className="text-[14.5px] sm:text-[16px] leading-relaxed text-[#81879c] max-w-xl mx-auto mb-8">
            Join engineering and FinOps teams who cut 30%+ on unnecessary AI token spend while preventing runaway budget spikes.
          </p>

          {/* Form / CTA Buttons */}
          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[#14b8a6] text-[14px] font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Thank you! We've sent your sandbox access link to {email}.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto mb-6">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email..."
                className="w-full px-4 py-3 bg-[#131622] border border-[#23293e] rounded-xl text-[13.5px] text-white placeholder-[#5a6075] focus:outline-none focus:border-[#38bdf8] transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-neutral-200 text-[#08090e] text-[13.5px] font-bold rounded-xl transition-all shadow-md"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-[#6b7185]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>14-day full enterprise trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>SOC 2 Type II compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
