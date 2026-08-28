"use client";

import React from "react";
import { ArrowRight, Eye, Shield, Zap, TrendingUp, DollarSign, PieChart } from "lucide-react";
import { motion } from "framer-motion";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
      {/* Left Column: Greeting & Key Pillars */}
      <div className="lg:col-span-7 space-y-7">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1
            className="text-[34px] sm:text-[42px] font-medium tracking-tight text-[#f4efe6] leading-[1.15]"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            <span>Welcome to OsterdOps.</span>
            <span className="text-[#dfba82] inline-block ml-1 font-serif text-3xl animate-pulse">*</span>
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#8e93a6] leading-relaxed max-w-[480px]">
            Let&apos;s get your AI cost governance workspace configured in a few simple steps.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button
            type="button"
            onClick={onNext}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(223,186,130,0.3)] hover:shadow-[0_6px_25px_rgba(223,186,130,0.45)] transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* 3 Pillars / Feature Highlight Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4"
        >
          {/* Card 1: Visibility */}
          <div className="p-4 bg-[#0d0f18]/80 border border-[#1b1e2c] rounded-2xl space-y-2 hover:border-[#dfba82]/40 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-[#171a29] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#e8eaf0]">Visibility</h4>
              <p className="text-[11.5px] text-[#7d8296] leading-snug mt-0.5">
                Understand AI usage across providers.
              </p>
            </div>
          </div>

          {/* Card 2: Governance */}
          <div className="p-4 bg-[#0d0f18]/80 border border-[#1b1e2c] rounded-2xl space-y-2 hover:border-[#dfba82]/40 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-[#171a29] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#e8eaf0]">Governance</h4>
              <p className="text-[11.5px] text-[#7d8296] leading-snug mt-0.5">
                Set budgets and enforce policies.
              </p>
            </div>
          </div>

          {/* Card 3: Optimization */}
          <div className="p-4 bg-[#0d0f18]/80 border border-[#1b1e2c] rounded-2xl space-y-2 hover:border-[#dfba82]/40 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-[#171a29] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#e8eaf0]">Optimization</h4>
              <p className="text-[11.5px] text-[#7d8296] leading-snug mt-0.5">
                Find opportunities to reduce unnecessary spend.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: 3D Obsidian Dashboard Card Preview with Podium */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[380px]">
        {/* Glow ambient background */}
        <div className="absolute w-72 h-72 bg-[#dfba82]/[0.08] rounded-full blur-[90px] pointer-events-none" />

        {/* Floating Dashboard Widget Card */}
        <motion.div
          initial={{ y: 15, opacity: 0, rotateX: 6, rotateY: -6 }}
          animate={{ y: [0, -8, 0], opacity: 1, rotateX: [6, 4, 6], rotateY: [-6, -4, -6] }}
          transition={{
            opacity: { duration: 0.6 },
            y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            rotateX: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            rotateY: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          }}
          className="w-full max-w-[360px] bg-[#0b0d14] border border-[#232738] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(223,186,130,0.1)] relative z-10 space-y-4"
        >
          {/* Card Header: AI Spend */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#73788c] uppercase">
              <span>AI SPEND</span>
              <span className="flex items-center gap-1 text-[#4ade80] text-[10.5px]">
                <TrendingUp className="w-3 h-3" />
                24.6% vs last month
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">$42,840</div>
          </div>

          {/* SVG Wave Line Chart */}
          <div className="h-16 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dfba82" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#dfba82" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,45 Q 40,25 75,35 T 150,15 T 225,28 T 300,8 L 300,60 L 0,60 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0,45 Q 40,25 75,35 T 150,15 T 225,28 T 300,8"
                fill="none"
                stroke="#dfba82"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="8" r="4" fill="#dfba82" className="animate-ping" />
              <circle cx="300" cy="8" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* Bottom Grid: Budget & Savings */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#171a27]">
            {/* Budget Arc Widget */}
            <div className="p-3 bg-[#11131c] rounded-xl border border-[#1d202e] flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#6e7387] font-medium">
                BUDGET
              </span>
              <div className="flex items-center gap-2.5 my-1.5">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#1f2233]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#dfba82]"
                      strokeDasharray="64, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white">64%</span>
                </div>
                <div className="text-[10.5px] text-[#8e93a6]">
                  of $65,000
                </div>
              </div>
            </div>

            {/* Savings Widget */}
            <div className="p-3 bg-[#11131c] rounded-xl border border-[#1d202e] flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#6e7387] font-medium">
                SAVINGS
              </span>
              <div className="my-1">
                <div className="text-base font-bold text-[#e8eaf0]">$8,420</div>
                <div className="text-[9.5px] text-[#4ade80] flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  18.7% vs last month
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glowing Pedestal / Podium Base */}
        <div className="relative -mt-6 w-[280px] h-[55px] flex items-center justify-center pointer-events-none">
          <div className="w-full h-8 rounded-[100%] bg-gradient-to-r from-transparent via-[#dfba82]/20 to-transparent blur-md transform rotate-X-[60deg]" />
          <div className="absolute top-2 w-[220px] h-[14px] rounded-[100%] border border-[#dfba82]/30 bg-[#090a0f] shadow-[0_0_25px_rgba(223,186,130,0.25)]" />
        </div>
      </div>
    </div>
  );
}
