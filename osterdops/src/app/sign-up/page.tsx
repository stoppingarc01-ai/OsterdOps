"use client";

import React from "react";
import { motion } from "framer-motion";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignUpPodiumIllustration } from "@/components/auth/SignUpPodiumIllustration";
import { SignUpCard } from "@/components/auth/SignUpCard";
import { SignUpTrustBanner } from "@/components/auth/SignUpTrustBanner";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080c] text-white selection:bg-[#dfba82] selection:text-black overflow-x-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft golden glow top left */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#dfba82]/[0.04] blur-[120px]" />
        {/* Subtle dark blue glow right */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[#1e293b]/[0.12] blur-[140px]" />
        {/* Bottom subtle golden wave gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#dfba82]/[0.02] to-transparent" />
      </div>

      {/* Top Header */}
      <AuthHeader type="sign-up" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 lg:py-10 relative z-10 flex flex-col items-center">
        {/* Top Split: Create Account Text (Left) + 3D Monitor Podium (Right) */}
        <div className="w-full max-w-[820px] grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-6">
          {/* Create Account Text Left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="md:col-span-7 pb-2"
          >
            <h1
              className="text-[34px] sm:text-[42px] font-medium tracking-tight text-[#f4efe6] leading-[1.1] flex items-center gap-2"
              style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
            >
              <span>Create your account</span>
              <span className="text-[#dfba82] text-[28px] sm:text-[34px]">✦</span>
            </h1>
            <p className="text-[13.5px] sm:text-[14.5px] text-[#8e93a6] mt-2.5 leading-relaxed max-w-[420px]">
              Join thousands of teams already optimizing with OsterdOps.
            </p>
          </motion.div>

          {/* 3D Podium Illustration Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="md:col-span-5 flex items-center justify-center md:justify-end -mb-8 sm:-mb-12 z-10"
          >
            <SignUpPodiumIllustration />
          </motion.div>
        </div>

        {/* Central Sign-Up Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="w-full flex justify-center z-20"
        >
          <SignUpCard />
        </motion.div>

        {/* Bottom Trust Banner (14-day free trial, No credit card, Cancel anytime) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
          className="w-full"
        >
          <SignUpTrustBanner />
        </motion.div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-6 text-center text-[11px] text-[#555a6e] relative z-10">
        <p>&copy; {new Date().getFullYear()} OsterdOps, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
