"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OpenAILogo,
  MetaLlamaLogo,
  MistralLogo,
} from "@/components/ui/ModelLogos";

interface AmbientLogo {
  id: string;
  name: string;
  provider: string;
  side: "left" | "right";
  topPercent: number; // percentage down the page
  offsetX: number; // px from edge
  rotation: number;
  duration: number;
  delay: number;
  renderLogo: () => React.ReactNode;
}

export function AmbientFloatingLogos() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const ambientLogos: AmbientLogo[] = [
    // LEFT SIDE LOGOS (Top to Bottom)
    {
      id: "deepseek-left-1",
      name: "DeepSeek-R1",
      provider: "DeepSeek",
      side: "left",
      topPercent: 5,
      offsetX: 12,
      rotation: -14,
      duration: 5.2,
      delay: 0.1,
      renderLogo: () => (
        <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <path
            d="M8 28C10 24 16 14 26 14C38 14 42 22 42 28C42 34 36 38 28 38C18 38 10 32 8 28Z"
            fill="#2563EB"
          />
          <path d="M38 22C41 18 44 14 46 16C48 18 44 24 41 26L38 22Z" fill="#1D4ED8" />
          <circle cx="16" cy="24" r="2" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      id: "gemini-left-2",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      side: "left",
      topPercent: 20,
      offsetX: 16,
      rotation: 12,
      duration: 6.0,
      delay: 0.4,
      renderLogo: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6">
          <defs>
            <linearGradient id="ambGemini" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          <path
            d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
            fill="url(#ambGemini)"
          />
        </svg>
      ),
    },
    {
      id: "anthropic-left-3",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      side: "left",
      topPercent: 36,
      offsetX: 10,
      rotation: -10,
      duration: 5.6,
      delay: 0.8,
      renderLogo: () => (
        <div className="font-extrabold text-base sm:text-lg text-[#080808] font-sans">
          A<span className="text-[#D97706]">\</span>
        </div>
      ),
    },
    {
      id: "groq-left-4",
      name: "Groq LPU",
      provider: "Groq",
      side: "left",
      topPercent: 52,
      offsetX: 18,
      rotation: 15,
      duration: 4.8,
      delay: 0.3,
      renderLogo: () => (
        <div className="font-extrabold text-xs sm:text-sm text-[#EA580C] font-mono lowercase">
          groq
        </div>
      ),
    },
    {
      id: "mistral-left-5",
      name: "Mistral Large",
      provider: "Mistral AI",
      side: "left",
      topPercent: 68,
      offsetX: 12,
      rotation: -12,
      duration: 6.4,
      delay: 1.0,
      renderLogo: () => (
        <MistralLogo className="w-5 h-5 sm:w-6 sm:h-6 text-[#EA580C]" size={24} />
      ),
    },
    {
      id: "llama-left-6",
      name: "Llama 3.3 70B",
      provider: "Meta",
      side: "left",
      topPercent: 84,
      offsetX: 14,
      rotation: 8,
      duration: 5.4,
      delay: 0.6,
      renderLogo: () => (
        <MetaLlamaLogo className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" size={24} />
      ),
    },

    // RIGHT SIDE LOGOS (Top to Bottom)
    {
      id: "openai-right-1",
      name: "GPT-4o",
      provider: "OpenAI",
      side: "right",
      topPercent: 7,
      offsetX: 14,
      rotation: 14,
      duration: 4.9,
      delay: 0.2,
      renderLogo: () => (
        <OpenAILogo className="w-6 h-6 sm:w-7 sm:h-7 text-[#080808]" size={28} />
      ),
    },
    {
      id: "cohere-right-2",
      name: "Command R+",
      provider: "Cohere",
      side: "right",
      topPercent: 23,
      offsetX: 12,
      rotation: -14,
      duration: 6.1,
      delay: 0.7,
      renderLogo: () => (
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#93C5FD] flex items-center justify-center p-1">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      ),
    },
    {
      id: "deepseek-right-3",
      name: "DeepSeek V3",
      provider: "DeepSeek",
      side: "right",
      topPercent: 39,
      offsetX: 18,
      rotation: 10,
      duration: 5.3,
      delay: 0.5,
      renderLogo: () => (
        <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <path
            d="M8 28C10 24 16 14 26 14C38 14 42 22 42 28C42 34 36 38 28 38C18 38 10 32 8 28Z"
            fill="#2563EB"
          />
          <circle cx="16" cy="24" r="2" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      id: "claude-right-4",
      name: "Claude 3.5 Haiku",
      provider: "Anthropic",
      side: "right",
      topPercent: 55,
      offsetX: 10,
      rotation: -16,
      duration: 5.7,
      delay: 0.9,
      renderLogo: () => (
        <div className="font-extrabold text-base sm:text-lg text-[#080808] font-sans">
          A<span className="text-[#D97706]">\</span>
        </div>
      ),
    },
    {
      id: "gemini-flash-right-5",
      name: "Gemini 1.5 Flash",
      provider: "Google",
      side: "right",
      topPercent: 71,
      offsetX: 16,
      rotation: 12,
      duration: 4.6,
      delay: 0.4,
      renderLogo: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6">
          <defs>
            <linearGradient id="ambGemini2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          <path
            d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
            fill="url(#ambGemini2)"
          />
        </svg>
      ),
    },
    {
      id: "openai-mini-right-6",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      side: "right",
      topPercent: 87,
      offsetX: 12,
      rotation: -8,
      duration: 5.8,
      delay: 0.2,
      renderLogo: () => (
        <OpenAILogo className="w-6 h-6 sm:w-7 sm:h-7 text-[#080808]" size={28} />
      ),
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none">
      {ambientLogos.map((item) => {
        const isHovered = hoveredId === item.id;
        const isLeft = item.side === "left";

        return (
          <div
            key={item.id}
            className="absolute pointer-events-auto"
            style={{
              top: `${item.topPercent}%`,
              [isLeft ? "left" : "right"]: `${item.offsetX}px`,
            }}
          >
            <motion.div
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              animate={{
                y: [-10, 10, -10],
                rotate: [item.rotation - 1.5, item.rotation + 2, item.rotation - 1.5],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
              whileHover={{
                scale: 1.22,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.2 },
              }}
              className="relative cursor-pointer rounded-2xl p-2 sm:p-2.5 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.65),0_4px_10px_rgba(0,0,0,0.3)] border border-neutral-100 transition-all hover:shadow-[0_0_28px_rgba(223,178,119,0.5)] group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                {item.renderLogo()}
              </div>

              {/* Floating Tooltip Pill on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full mt-2 ${
                      isLeft ? "left-0" : "right-0"
                    } px-2.5 py-1 rounded-lg bg-[#0C0D12] border border-[#1F2230] shadow-2xl text-[10px] font-mono text-white whitespace-nowrap z-50`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>{item.name}</span>
                      <span className="text-[#DFB277] text-[8.5px]">({item.provider})</span>
                    </div>
                    <div className="text-[9px] text-[#10B981]">Active in Gateway</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
