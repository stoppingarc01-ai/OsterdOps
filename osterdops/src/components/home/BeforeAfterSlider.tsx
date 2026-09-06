"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ZapOff,
  Sparkles,
  Key,
  Lock,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(clampedPercentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Safe fallback
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto my-16 sm:my-24 px-4 sm:px-6">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(223,178,119,0.06),transparent_70%)] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase mb-3 shadow-[0_0_12px_rgba(223,178,119,0.15)]">
          <Sparkles className="w-3 h-3 text-[#DFB277]" />
          <span>Interactive Architecture Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-white font-sans leading-tight">
          Production Without vs. With OsterdOps
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm sm:text-base max-w-2xl mx-auto mt-2.5 font-sans leading-relaxed">
          Drag the center handle to inspect how active FinOps circuit-breakers eliminate runaway billing surges and upstream provider outages.
        </p>
      </div>

      {/* Comparison Frame */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[560px] sm:h-[460px] rounded-2xl overflow-hidden select-none border border-[#1F222E] hover:border-[#DFB277]/40 transition-colors bg-[#080B11] shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-ew-resize touch-none"
      >
        {/* AFTER PANEL (Right / Emerald & Gold Governed Layer) */}
        <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#06120E] via-[#080F16] to-[#04080D]">
          <div className="flex justify-end items-center">
            <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> With OsterdOps Firewall
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 ml-auto w-full sm:w-[85%] mt-auto pb-2">
            <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" /> Governed Monthly Spend
              </div>
              <p className="text-2xl font-bold text-white font-mono">$1,240.00</p>
              <p className="text-xs text-neutral-400 mt-1">Hard budget cap locked at $1,500/mo</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" /> Zero-Downtime Fallback
              </div>
              <p className="text-xs text-emerald-300 font-mono font-medium">Claude 503 → Gemini 2.0 Flash</p>
              <p className="text-xs text-neutral-400 mt-1">0 client errors • 112ms transparent switch</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Lock className="w-4 h-4" /> Single Encrypted Gateway Key
              </div>
              <p className="text-xs font-mono text-neutral-300">ost_live_9f8a... (SHA-256)</p>
              <p className="text-xs text-neutral-400 mt-1">Zero raw provider keys exposed in repos</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Sparkles className="w-4 h-4" /> Active Loop Breaker
              </div>
              <p className="text-xs text-emerald-300 font-semibold font-mono">Tripped on 10th duplicate</p>
              <p className="text-xs text-neutral-400 mt-1">$680 runaway loss prevented automatically</p>
            </div>
          </div>
        </div>

        {/* BEFORE PANEL (Left / Rose & Crimson Chaotic Layer Clipped) */}
        <div
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#1E0B0B] via-[#120707] to-[#0A0404]"
        >
          <div className="flex items-center">
            <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Direct Unmonitored SDK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 w-full sm:w-[85%] mt-auto pb-2">
            <div className="p-4 rounded-xl bg-neutral-950/90 border border-rose-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <TrendingUp className="w-4 h-4" /> Uncontrolled Billing Spike
              </div>
              <p className="text-2xl font-bold text-rose-400 font-mono">$4,820.50</p>
              <p className="text-xs text-rose-300/80 mt-1">+312% overage with no circuit breaker</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/90 border border-rose-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <ZapOff className="w-4 h-4" /> Unhandled Provider Outage
              </div>
              <p className="text-xs font-mono text-rose-400 font-medium">HTTP 503 Service Unavailable</p>
              <p className="text-xs text-neutral-400 mt-1">End users dropped • No automated fallback</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/90 border border-rose-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <Key className="w-4 h-4" /> Scattered Raw API Keys
              </div>
              <p className="text-xs font-mono text-neutral-400">sk-ant-api03-9xL12...</p>
              <p className="text-xs text-rose-300/80 mt-1">Hardcoded across microservice .env files</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/90 border border-rose-500/25 shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <ShieldAlert className="w-4 h-4" /> Runaway Worker Loop
              </div>
              <p className="text-xs text-rose-400 font-semibold font-mono">24,000 rapid calls</p>
              <p className="text-xs text-neutral-400 mt-1">Recursive bug drained OpenAI balance in 4 mins</p>
            </div>
          </div>
        </div>

        {/* DRAGGABLE DIVIDER HANDLE */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#DFB277] via-white to-[#DFB277] shadow-[0_0_14px_rgba(223,178,119,0.9)] pointer-events-none"
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0E0F14] border-2 border-[#DFB277] shadow-[0_0_16px_rgba(223,178,119,0.5)] flex items-center justify-center text-white text-xs backdrop-blur-md">
            <span className="text-[12px] font-bold text-[#DFB277] select-none">↔</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSlider;
