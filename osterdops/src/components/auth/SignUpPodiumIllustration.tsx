"use client";

import React from "react";
import { motion } from "framer-motion";

export function SignUpPodiumIllustration() {
  return (
    <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#dfba82]/12 via-[#dfba82]/5 to-transparent rounded-full blur-2xl" />

      {/* Orbit Wireframe Rings */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full opacity-35 animate-[spin_70s_linear_infinite]"
      >
        <ellipse
          cx="200"
          cy="230"
          rx="185"
          ry="70"
          fill="none"
          stroke="#dfba82"
          strokeWidth="0.75"
          strokeDasharray="4 6"
        />
        <ellipse
          cx="200"
          cy="230"
          rx="145"
          ry="55"
          fill="none"
          stroke="#dfba82"
          strokeWidth="0.5"
        />
      </svg>

      {/* Central 3D Podium & Tilted Monitor */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Floating 3D Tilted Dashboard Display */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 mb-[-30px]"
          style={{ perspective: "1000px" }}
        >
          <div
            className="w-56 h-36 rounded-xl bg-[#0a0c12] border border-[#262c3e] p-2.5 shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(223,186,130,0.15)] flex flex-col justify-between transform-gpu"
            style={{
              transform: "rotateX(14deg) rotateY(-8deg) rotateZ(3deg)",
            }}
          >
            {/* Monitor Top Bar */}
            <div className="flex items-center justify-between pb-1.5 border-b border-[#181d2c]">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[#dfba82]" />
                <div className="h-1.5 w-8 rounded-full bg-[#1e2436]" />
              </div>
              <div className="h-1.5 w-5 rounded-full bg-[#1e2436]" />
            </div>

            {/* Monitor Content Grid */}
            <div className="grid grid-cols-12 gap-1.5 flex-1 pt-1.5">
              {/* Left Side: Line Chart & Mini Rows (7 cols) */}
              <div className="col-span-7 flex flex-col justify-between">
                {/* Spline Chart */}
                <div className="h-12 w-full bg-[#0d101a] rounded p-1 flex items-center">
                  <svg viewBox="0 0 100 40" className="w-full h-full">
                    <path
                      d="M 2 32 C 15 28, 25 35, 40 22 C 55 12, 70 20, 98 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="98" cy="6" r="2" fill="#faeedb" />
                  </svg>
                </div>
                {/* Mini Metric Bars */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-[#151927] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[#dfba82]" />
                  </div>
                  <div className="h-1.5 w-full bg-[#151927] rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-[#5478a8]" />
                  </div>
                </div>
              </div>

              {/* Right Side: Donut & Bar Chart (5 cols) */}
              <div className="col-span-5 flex flex-col justify-between">
                {/* Donut Ring */}
                <div className="h-12 w-full bg-[#0d101a] rounded p-1 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="13"
                      fill="none"
                      stroke="#22283a"
                      strokeWidth="5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="13"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="5"
                      strokeDasharray="45 100"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="13"
                      fill="none"
                      stroke="#faeedb"
                      strokeWidth="5"
                      strokeDasharray="25 100"
                      strokeDashoffset="-45"
                    />
                  </svg>
                </div>

                {/* Mini Bar Columns */}
                <div className="h-7 w-full bg-[#0d101a] rounded p-1 flex items-end justify-between px-1.5">
                  <div className="w-1.5 h-3 bg-[#dfba82] rounded-t-sm" />
                  <div className="w-1.5 h-4.5 bg-[#dfba82] rounded-t-sm" />
                  <div className="w-1.5 h-2.5 bg-[#5478a8] rounded-t-sm" />
                  <div className="w-1.5 h-5 bg-[#faeedb] rounded-t-sm" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3D Multi-Tiered Metallic Gold & Obsidian Podium */}
        <div className="relative z-10 w-48 h-24">
          <svg viewBox="0 0 220 110" className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="podiumTop2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#252938" />
                <stop offset="50%" stopColor="#141722" />
                <stop offset="100%" stopColor="#0c0e15" />
              </linearGradient>
              <linearGradient id="goldRingGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#875e24" />
                <stop offset="25%" stopColor="#dfba82" />
                <stop offset="50%" stopColor="#faeedb" />
                <stop offset="75%" stopColor="#dfba82" />
                <stop offset="100%" stopColor="#875e24" />
              </linearGradient>
              <linearGradient id="baseCylinder2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0c12" />
                <stop offset="30%" stopColor="#1a1e2b" />
                <stop offset="70%" stopColor="#222838" />
                <stop offset="100%" stopColor="#0a0c12" />
              </linearGradient>
            </defs>

            {/* Bottom Tier Gold Base Rim */}
            <ellipse cx="110" cy="85" rx="95" ry="22" fill="url(#goldRingGrad2)" />
            <path
              d="M15 85 C15 97 55 107 110 107 C165 107 205 97 205 85 L205 90 C205 102 165 112 110 112 C55 112 15 102 15 90 Z"
              fill="#523916"
            />

            {/* Middle Cylinder Layer */}
            <path
              d="M25 65 C25 76 63 85 110 85 C157 85 195 76 195 65 L195 82 C195 93 157 102 110 102 C63 102 25 93 25 82 Z"
              fill="url(#baseCylinder2)"
            />

            {/* Upper Tier Gold Ring */}
            <ellipse cx="110" cy="65" rx="85" ry="19" fill="url(#goldRingGrad2)" />

            {/* Top Obsidian Surface */}
            <ellipse cx="110" cy="63" rx="76" ry="16" fill="url(#podiumTop2)" stroke="#dfba82" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
