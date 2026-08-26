"use client";

import React from "react";
import { motion } from "framer-motion";

export function SignInPodiumIllustration() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#dfba82]/10 via-[#dfba82]/5 to-transparent rounded-full blur-2xl" />

      {/* Orbit Wireframe Rings */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full opacity-40 animate-[spin_60s_linear_infinite]"
      >
        <ellipse
          cx="200"
          cy="220"
          rx="180"
          ry="65"
          fill="none"
          stroke="#dfba82"
          strokeWidth="0.75"
          strokeDasharray="4 6"
        />
        <ellipse
          cx="200"
          cy="220"
          rx="140"
          ry="50"
          fill="none"
          stroke="#dfba82"
          strokeWidth="0.5"
        />
        <ellipse
          cx="200"
          cy="220"
          rx="90"
          ry="30"
          fill="none"
          stroke="#dfba82"
          strokeWidth="0.75"
          strokeDasharray="2 4"
        />
      </svg>

      {/* Central 3D Podium & Shield Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Floating 3D Golden Shield Emblem */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 mb-[-25px]"
        >
          <svg viewBox="0 0 160 180" className="w-32 h-36 drop-shadow-[0_15px_30px_rgba(223,186,130,0.35)]">
            <defs>
              <linearGradient id="goldShieldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#faeedb" />
                <stop offset="30%" stopColor="#dfba82" />
                <stop offset="70%" stopColor="#b28441" />
                <stop offset="100%" stopColor="#5c411c" />
              </linearGradient>
              <linearGradient id="shieldInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e222e" />
                <stop offset="50%" stopColor="#12141c" />
                <stop offset="100%" stopColor="#08090e" />
              </linearGradient>
              <linearGradient id="goldShieldCore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3dc" />
                <stop offset="50%" stopColor="#dfba82" />
                <stop offset="100%" stopColor="#9a7032" />
              </linearGradient>
              <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Golden Shield Frame */}
            <path
              d="M80 8 L142 34 V94 C142 134 80 168 80 168 C80 168 18 134 18 94 V34 Z"
              fill="url(#goldShieldOuter)"
              stroke="#faeedb"
              strokeWidth="1.5"
            />

            {/* Inner Dark Face */}
            <path
              d="M80 20 L130 42 V92 C130 124 80 152 80 152 C80 152 30 124 30 92 V42 Z"
              fill="url(#shieldInner)"
            />

            {/* Inner Gold Shield Core */}
            <path
              d="M80 38 L114 54 V88 C114 110 80 130 80 130 C80 130 46 110 46 88 V54 Z"
              fill="none"
              stroke="url(#goldShieldCore)"
              strokeWidth="4"
              filter="url(#shieldGlow)"
            />
            <path
              d="M80 50 L102 62 V85 C102 100 80 114 80 114 C80 114 58 100 58 85 V62 Z"
              fill="url(#goldShieldCore)"
            />
          </svg>
        </motion.div>

        {/* 3D Multi-Tiered Metallic Gold & Obsidian Podium */}
        <div className="relative z-10 w-48 h-24">
          <svg viewBox="0 0 220 110" className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="podiumTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#252938" />
                <stop offset="50%" stopColor="#141722" />
                <stop offset="100%" stopColor="#0c0e15" />
              </linearGradient>
              <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#875e24" />
                <stop offset="25%" stopColor="#dfba82" />
                <stop offset="50%" stopColor="#faeedb" />
                <stop offset="75%" stopColor="#dfba82" />
                <stop offset="100%" stopColor="#875e24" />
              </linearGradient>
              <linearGradient id="baseCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0c12" />
                <stop offset="30%" stopColor="#1a1e2b" />
                <stop offset="70%" stopColor="#222838" />
                <stop offset="100%" stopColor="#0a0c12" />
              </linearGradient>
            </defs>

            {/* Bottom Tier Gold Base Rim */}
            <ellipse cx="110" cy="85" rx="95" ry="22" fill="url(#goldRingGrad)" />
            <path
              d="M15 85 C15 97 55 107 110 107 C165 107 205 97 205 85 L205 90 C205 102 165 112 110 112 C55 112 15 102 15 90 Z"
              fill="#523916"
            />

            {/* Middle Cylinder Layer */}
            <path
              d="M25 65 C25 76 63 85 110 85 C157 85 195 76 195 65 L195 82 C195 93 157 102 110 102 C63 102 25 93 25 82 Z"
              fill="url(#baseCylinder)"
            />

            {/* Upper Tier Gold Ring */}
            <ellipse cx="110" cy="65" rx="85" ry="19" fill="url(#goldRingGrad)" />

            {/* Top Obsidian Surface */}
            <ellipse cx="110" cy="63" rx="76" ry="16" fill="url(#podiumTop)" stroke="#dfba82" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Floating 3D Golden Lock (Left) */}
      <motion.div
        animate={{ y: [0, -7, 0], x: [0, -2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-4 top-16 z-30"
      >
        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#1b1f2c]/90 to-[#0e111a]/90 border border-[#dfba82]/50 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(223,186,130,0.2)] backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#dfba82]" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="url(#goldRingGrad)" fillOpacity="0.2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1.5" fill="#dfba82" />
          </svg>
        </div>
      </motion.div>

      {/* Floating 3D Chart Card (Top Right) */}
      <motion.div
        animate={{ y: [0, 6, 0], x: [0, 2, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-4 top-18 z-30"
      >
        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#1b1f2c]/90 to-[#0e111a]/90 border border-[#dfba82]/50 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(223,186,130,0.2)] backdrop-blur-sm">
          <svg viewBox="0 0 32 24" className="w-7 h-5 text-[#dfba82]">
            <path d="M2 18 L10 12 L18 15 L30 4" fill="none" stroke="#dfba82" strokeWidth="2" strokeLinecap="round" />
            <rect x="5" y="14" width="3" height="8" rx="1" fill="#dfba82" fillOpacity="0.6" />
            <rect x="13" y="10" width="3" height="12" rx="1" fill="#dfba82" fillOpacity="0.8" />
            <rect x="21" y="7" width="3" height="15" rx="1" fill="#faeedb" />
          </svg>
        </div>
      </motion.div>

      {/* Floating 3D Gold Coin ($) (Bottom Right) */}
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute right-8 bottom-16 z-30"
      >
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#976a2b] via-[#dfba82] to-[#faeedb] border border-[#faeedb] shadow-[0_0_18px_rgba(223,186,130,0.4)] flex items-center justify-center font-bold text-[#35230c] text-[13px]">
          $
        </div>
      </motion.div>
    </div>
  );
}
