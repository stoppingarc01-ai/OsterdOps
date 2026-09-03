"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Terminal,
  ShieldAlert,
  Home,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  RotateCw,
  Eye,
  Flame,
} from "lucide-react";

// Web Audio API Synth for Retro Sci-Fi Robot Bloops
function playRetroBloop(type: "wake" | "poke" | "overclock" | "sleep") {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "wake") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "poke") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "overclock") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "sleep") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext silenced if browser policy blocks autoplay before gesture
  }
}

const ROBOT_QUOTES = [
  "*bloop* 404: token route vaporized in the void!",
  "*whirrr* scanning 64+ alternative models...",
  "*beep boop* did you mean to open the console?",
  "*zap* zero PII leaked during this navigation incident!",
  "*giggle* hey! that tickles my circuits!",
  "*chirp* pre-flight firewall halted non-existent route!",
  "*beep* 11.4µs wire overhead maintained even in 404!",
];

export default function NotFound() {
  const [isHovered, setIsHovered] = useState(false);
  const [mode, setMode] = useState<"normal" | "overclock" | "sleep">("normal");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax & Eye Pupil Tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize coordinates [-1 to 1]
      const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      setMousePos({ x: nx, y: ny });
    },
    []
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (mode === "sleep") setMode("normal");
    if (soundEnabled) playRetroBloop("wake");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Click / Poke Action
  const handlePokeRobot = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setQuoteIndex((prev) => (prev + 1) % ROBOT_QUOTES.length);
    if (soundEnabled) {
      if (mode === "overclock") {
        playRetroBloop("overclock");
      } else {
        playRetroBloop("poke");
      }
    }
    setTimeout(() => setIsSpinning(false), 700);
  };

  // Switch Modes
  const handleSetMode = (newMode: "normal" | "overclock" | "sleep") => {
    setMode(newMode);
    if (soundEnabled) {
      if (newMode === "sleep") playRetroBloop("sleep");
      else if (newMode === "overclock") playRetroBloop("overclock");
      else playRetroBloop("wake");
    }
  };

  const isAsleep = mode === "sleep" && !isHovered;
  const isOverclocked = mode === "overclock" || (isHovered && mode !== "sleep");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#080808] font-sans relative overflow-hidden">
      {/* 40px Monospace Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none" />

      {/* Dynamic Central Ambient Glow (Gold / Cyan) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isOverclocked
            ? "bg-[#DFB277]/15 scale-125"
            : isAsleep
            ? "bg-blue-950/10 scale-90"
            : "bg-[#DFB277]/08 scale-100"
        }`}
      />

      {/* Header Bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        {/* Brand Crest */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(223,178,119,0.45)]">
            <Image
              src="/osterdops-logo.png"
              alt="OsterdOps Emblem"
              width={32}
              height={32}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="font-bold text-base tracking-tight font-sans text-white">
            Osterd<span className="text-[#DFB277]">Ops</span>
          </span>
        </Link>

        {/* Top Right Controls: Audio Toggle + Error Code Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10121A] border border-[#1E212E] hover:border-[#DFB277]/40 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title={soundEnabled ? "Mute robot sound effects" : "Enable robot sound effects"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#DFB277]" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
            <span className="hidden sm:inline text-[10px]">{soundEnabled ? "SFX On" : "SFX Muted"}</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111218] border border-[#1F2230] text-[11px] font-mono text-neutral-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-neutral-500">ERR //</span>
            <span className="text-white font-bold">404_VOID</span>
          </div>
        </div>
      </header>

      {/* Main Center Body */}
      <main className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-center space-y-6 my-auto">
        {/* INTERACTIVE CARTOON ROBOT HERO STAGE */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handlePokeRobot}
          className="relative flex flex-col items-center justify-center cursor-pointer select-none group py-4 px-8"
          title="Click to poke the robot!"
        >
          {/* Floating Monospace Speech Bubble */}
          <div
            className={`absolute -top-10 sm:-top-12 transition-all duration-300 z-30 pointer-events-none ${
              isHovered || isOverclocked || isSpinning
                ? "opacity-100 translate-y-0 scale-100"
                : isAsleep
                ? "opacity-100 -translate-y-1 scale-95"
                : "opacity-0 translate-y-2 scale-90"
            }`}
          >
            <div className="relative px-4 py-2 rounded-2xl bg-[#0F111A]/95 backdrop-blur-md border border-[#DFB277]/50 shadow-[0_6px_25px_rgba(0,0,0,0.85)] text-xs font-mono text-[#DFB277] flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#DFB277] animate-ping" />
              <span className="font-semibold">
                {isAsleep ? "zzZ... zZ... (sleeping)" : ROBOT_QUOTES[quoteIndex]}
              </span>
              {/* Tooltip beak tip */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0F111A] border-b border-r border-[#DFB277]/50 rotate-45" />
            </div>
          </div>

          {/* Floating Ambient Sparkles (visible when hovered / overclocked) */}
          {(isHovered || isOverclocked) && (
            <>
              <span className="absolute -left-6 top-8 text-[#DFB277] text-lg animate-bounce pointer-events-none opacity-80">
                ✦
              </span>
              <span className="absolute -right-6 top-16 text-[#38BDF8] text-base animate-pulse pointer-events-none opacity-80">
                ⚡
              </span>
              <span className="absolute left-10 -top-2 text-[#10B981] text-xs animate-ping pointer-events-none opacity-70">
                •
              </span>
            </>
          )}

          {/* Robot Canvas with 3D Parallax Tilt */}
          <div
            style={{
              transform: `perspective(800px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 14}deg) ${
                isSpinning ? "rotate(360deg)" : ""
              }`,
              transition: isSpinning
                ? "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "transform 0.15s ease-out",
            }}
            className="relative"
          >
            {/* Live Floating Bobbing wrapper */}
            <div
              className={`transition-all duration-500 ease-out transform ${
                isOverclocked
                  ? "-translate-y-5 scale-110"
                  : isHovered
                  ? "-translate-y-3 scale-105"
                  : isAsleep
                  ? "translate-y-2 scale-95 opacity-85"
                  : "translate-y-0 scale-100"
              }`}
            >
              <svg
                viewBox="0 0 240 250"
                className="w-52 h-52 sm:w-60 sm:h-60 overflow-visible drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Chassis Metallic Gradient */}
                  <linearGradient id="chassisGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#222536" />
                    <stop offset="50%" stopColor="#151722" />
                    <stop offset="100%" stopColor="#0B0D13" />
                  </linearGradient>

                  {/* Visor Dark Screen Gradient */}
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D0F18" />
                    <stop offset="100%" stopColor="#05060A" />
                  </linearGradient>

                  {/* Thruster Flame Gradient (Gold to Transparent) */}
                  <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DFB277" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                  </linearGradient>

                  {/* Overclock Plasma Flame Gradient */}
                  <linearGradient id="overclockFlame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#DFB277" stopOpacity="0" />
                  </linearGradient>

                  {/* Gold Glow Filter */}
                  <filter id="goldBloom" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* ================= ION THRUSTERS & FLAME JETS ================= */}
                {/* Left Thruster Jet */}
                <g opacity={isAsleep ? 0 : isOverclocked ? 1 : isHovered ? 0.85 : 0.45}>
                  <polygon
                    points="95,208 85,242 105,242"
                    fill={isOverclocked ? "url(#overclockFlame)" : "url(#flameGrad)"}
                    className="animate-pulse"
                  />
                  {/* Right Thruster Jet */}
                  <polygon
                    points="145,208 135,242 155,242"
                    fill={isOverclocked ? "url(#overclockFlame)" : "url(#flameGrad)"}
                    className="animate-pulse"
                  />
                  {/* Particle embers flying down */}
                  {(isHovered || isOverclocked) && (
                    <>
                      <circle cx="95" cy="245" r="2" fill="#DFB277" className="animate-ping" />
                      <circle cx="145" cy="248" r="2" fill="#38BDF8" className="animate-ping" />
                    </>
                  )}
                </g>

                {/* Left Thruster Nozzle */}
                <rect x="87" y="198" width="16" height="10" rx="3" fill="#1C1F2E" stroke="#333852" strokeWidth="1.5" />
                {/* Right Thruster Nozzle */}
                <rect x="137" y="198" width="16" height="10" rx="3" fill="#1C1F2E" stroke="#333852" strokeWidth="1.5" />

                {/* ================= ANTENNA & BULB ================= */}
                {/* Antenna Stem */}
                <line
                  x1="120"
                  y1="28"
                  x2="120"
                  y2="58"
                  stroke={isOverclocked ? "#DFB277" : isHovered ? "#DFB277" : "#32374D"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
                <circle
                  cx="120"
                  cy="40"
                  r="3.5"
                  fill={isOverclocked ? "#DFB277" : isHovered ? "#DFB277" : "#202333"}
                  className="transition-colors duration-300"
                />

                {/* Radar Sonar Ping Rings (on hover / overclock) */}
                {(isHovered || isOverclocked) && (
                  <>
                    <circle cx="120" cy="22" r="14" stroke="#DFB277" strokeWidth="1.5" className="animate-ping opacity-60" />
                    <circle cx="120" cy="22" r="22" stroke="#38BDF8" strokeWidth="1" className="animate-ping opacity-30" />
                  </>
                )}

                {/* Top Antenna Bulb */}
                <circle
                  cx="120"
                  cy="22"
                  r="9"
                  fill={isOverclocked ? "#38BDF8" : isHovered ? "#DFB277" : isAsleep ? "#1F2230" : "#3F455F"}
                  stroke={isOverclocked ? "#FFFFFF" : isHovered ? "#FFF2DB" : "#2B3045"}
                  strokeWidth="2.5"
                  filter={isHovered || isOverclocked ? "url(#goldBloom)" : undefined}
                  className="transition-all duration-300"
                />

                {/* ================= EAR KNOBS / SCI-FI TUNING DIALS ================= */}
                {/* Left Ear Knurled Dial */}
                <rect x="30" y="82" width="14" height="32" rx="4" fill="#151724" stroke="#2D3249" strokeWidth="2" />
                <line x1="34" y1="90" x2="34" y2="106" stroke={isHovered ? "#DFB277" : "#454C6D"} strokeWidth="2" />
                <line x1="38" y1="90" x2="38" y2="106" stroke={isHovered ? "#DFB277" : "#454C6D"} strokeWidth="2" />

                {/* Right Ear Knurled Dial */}
                <rect x="196" y="82" width="14" height="32" rx="4" fill="#151724" stroke="#2D3249" strokeWidth="2" />
                <line x1="202" y1="90" x2="202" y2="106" stroke={isHovered ? "#DFB277" : "#454C6D"} strokeWidth="2" />
                <line x1="206" y1="90" x2="206" y2="106" stroke={isHovered ? "#DFB277" : "#454C6D"} strokeWidth="2" />

                {/* ================= HEAD CHASSIS ================= */}
                <rect
                  x="42"
                  y="56"
                  width="156"
                  height="106"
                  rx="26"
                  fill="url(#chassisGrad)"
                  stroke={isOverclocked ? "#DFB277" : isHovered ? "#DFB277" : "#262A3D"}
                  strokeWidth={isHovered || isOverclocked ? "3" : "2"}
                  className="transition-colors duration-400"
                />

                {/* Golden Screws / Corner Rivets */}
                <circle cx="56" cy="70" r="2.5" fill={isHovered ? "#DFB277" : "#32374E"} />
                <circle cx="184" cy="70" r="2.5" fill={isHovered ? "#DFB277" : "#32374E"} />
                <circle cx="56" cy="150" r="2.5" fill={isHovered ? "#DFB277" : "#32374E"} />
                <circle cx="184" cy="150" r="2.5" fill={isHovered ? "#DFB277" : "#32374E"} />

                {/* ================= VISOR GLASS SCREEN ================= */}
                <rect
                  x="54"
                  y="68"
                  width="132"
                  height="82"
                  rx="18"
                  fill="url(#screenGrad)"
                  stroke="#1E2130"
                  strokeWidth="1.5"
                />

                {/* Scanning CRT Raster Grid Lines */}
                <line
                  x1="58"
                  y1={100 + mousePos.y * 14}
                  x2="182"
                  y2={100 + mousePos.y * 14}
                  stroke="#DFB277"
                  strokeOpacity={isHovered ? "0.35" : "0.08"}
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  className="transition-all duration-100"
                />

                {/* ================= FACIAL EXPRESSION LAYER ================= */}
                {/* 1. Eyebrows */}
                {isAsleep ? (
                  /* Sleep: Drooping closed horizontal lines */
                  <g stroke="#393E54" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="78" y1="96" x2="102" y2="96" />
                    <line x1="138" y1="96" x2="162" y2="96" />
                  </g>
                ) : isOverclocked ? (
                  /* Overclock / Active Hover: Focused fierce / curious sharp brows */
                  <g stroke="#DFB277" strokeWidth="3" strokeLinecap="round">
                    <line x1="78" y1="88" x2="102" y2="90" />
                    <line x1="138" y1="90" x2="162" y2="88" />
                  </g>
                ) : isHovered ? (
                  /* Curious Level Eyebrows */
                  <g stroke="#DFB277" strokeWidth="3" strokeLinecap="round">
                    <line x1="78" y1="88" x2="102" y2="88" />
                    <line x1="138" y1="88" x2="162" y2="88" />
                  </g>
                ) : (
                  /* Default Sad / Bored: Angled down frown eyebrows */
                  <g stroke="#4E546E" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="78" y1="95" x2="102" y2="89" />
                    <line x1="138" y1="89" x2="162" y2="95" />
                  </g>
                )}

                {/* 2. Eyes with Live Pupil Cursor Tracking */}
                {isAsleep ? (
                  /* Sleep: Gentle curved closed eyelids */
                  <g stroke="#444A63" strokeWidth="2.5" strokeLinecap="round" fill="none">
                    <path d="M80 108 Q90 114 100 108" />
                    <path d="M140 108 Q150 114 160 108" />
                  </g>
                ) : isOverclocked || isHovered ? (
                  /* Active: Big Glowing Golden Eyes with pupils following cursor */
                  <g filter="url(#goldBloom)">
                    {/* Left Eye Socket */}
                    <circle cx="90" cy="106" r="11" fill="#DFB277" />
                    {/* Right Eye Socket */}
                    <circle cx="150" cy="106" r="11" fill="#DFB277" />

                    {/* Left Pupil (Tracks mouse) */}
                    <circle
                      cx={90 + mousePos.x * 4.5}
                      cy={106 + mousePos.y * 4}
                      r="4"
                      fill="#080808"
                    />
                    {/* Right Pupil (Tracks mouse) */}
                    <circle
                      cx={150 + mousePos.x * 4.5}
                      cy={106 + mousePos.y * 4}
                      r="4"
                      fill="#080808"
                    />

                    {/* Highlights / Glint */}
                    <circle cx="87" cy="102" r="2" fill="#FFFFFF" />
                    <circle cx="147" cy="102" r="2" fill="#FFFFFF" />
                  </g>
                ) : (
                  /* Default Sad: Dim horizontal slits */
                  <g fill="#43485E">
                    <rect x="80" y="104" width="20" height="4" rx="2" />
                    <rect x="140" y="104" width="20" height="4" rx="2" />
                  </g>
                )}

                {/* 3. Mouth */}
                {isAsleep ? (
                  /* Sleep: Small dot / peaceful line */
                  <line x1="116" y1="130" x2="124" y2="130" stroke="#3F455E" strokeWidth="2" strokeLinecap="round" />
                ) : isOverclocked ? (
                  /* Overclock: Wide enthusiastic happy grin */
                  <path
                    d="M106 128 Q120 140 134 128"
                    stroke="#DFB277"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="#080808"
                  />
                ) : isHovered ? (
                  /* Hover: Curious 'O' shape */
                  <circle
                    cx="120"
                    cy="130"
                    r="6.5"
                    fill="#080808"
                    stroke="#DFB277"
                    strokeWidth="2.5"
                  />
                ) : (
                  /* Default: Sad downward frown */
                  <path
                    d="M108 134 Q120 126 132 134"
                    stroke="#4E546E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}

                {/* ================= TORSO & FINOPS GAUGE ================= */}
                {/* Neck Ring */}
                <rect x="110" y="162" width="20" height="8" rx="2" fill="#141624" stroke="#272B3E" strokeWidth="1" />

                {/* Torso Chassis */}
                <path
                  d="M72 170 C72 170 82 196 90 206 C98 214 142 214 150 206 C158 196 168 170 168 170 Z"
                  fill="url(#chassisGrad)"
                  stroke={isHovered || isOverclocked ? "#DFB277" : "#242738"}
                  strokeWidth={isHovered || isOverclocked ? "2.5" : "1.5"}
                  className="transition-colors duration-400"
                />

                {/* FinOps Battery / Heart Gauge */}
                <rect x="102" y="180" width="36" height="13" rx="3.5" fill="#08090E" stroke="#1D2030" strokeWidth="1" />
                <rect
                  x="105"
                  y="183"
                  width={isOverclocked ? "30" : isHovered ? "25" : isAsleep ? "4" : "10"}
                  height="7"
                  rx="2"
                  fill={isOverclocked ? "#38BDF8" : isHovered ? "#10B981" : isAsleep ? "#6B7280" : "#F43F5E"}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* Dynamic Floor Shadow & Thruster Glow */}
          <div className="relative mt-2 flex items-center justify-center">
            {/* Thruster reflection glow */}
            {(isHovered || isOverclocked) && (
              <div
                className={`absolute w-24 h-6 rounded-full blur-[10px] pointer-events-none transition-all duration-300 ${
                  isOverclocked ? "bg-[#38BDF8]/40" : "bg-[#DFB277]/30"
                }`}
              />
            )}
            {/* Dark Floor Shadow */}
            <div
              className={`w-40 sm:w-48 h-4 bg-gradient-to-r from-transparent via-black to-transparent rounded-full filter blur-[5px] transition-all duration-500 ${
                isOverclocked
                  ? "scale-65 opacity-25"
                  : isHovered
                  ? "scale-75 opacity-35"
                  : isAsleep
                  ? "scale-105 opacity-95"
                  : "scale-100 opacity-80"
              }`}
            />
          </div>
        </div>

        {/* INTERACTIVE ROBOT CONTROL DOCK (PLAYFUL LIVE TOGGLES) */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0F1018] border border-[#1E212F] shadow-lg">
          <button
            onClick={() => handleSetMode("normal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              mode === "normal"
                ? "bg-[#DFB277] text-[#080808] font-bold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Active</span>
          </button>

          <button
            onClick={() => handleSetMode("overclock")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              mode === "overclock"
                ? "bg-[#38BDF8] text-[#080808] font-bold shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Overclock</span>
          </button>

          <button
            onClick={() => handleSetMode("sleep")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              mode === "sleep"
                ? "bg-[#1E2235] text-neutral-200 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>💤 Sleep</span>
          </button>

          <button
            onClick={handlePokeRobot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#161824] hover:bg-[#202336] text-[#DFB277] border border-[#DFB277]/30 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
            <span>Poke Bot</span>
          </button>
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/30 text-[#DFB277] text-xs font-mono font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#DFB277] animate-pulse" />
          <span>404 // Out of Boundaries</span>
        </div>

        {/* Headlines & Subtitle */}
        <div className="space-y-2.5 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
            Packet Dropped in the <span className="text-[#DFB277]">Void</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            The route or resource you are requesting does not exist in the OsterdOps routing mesh. It might have been relocated, pruned, or never provisioned.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full max-w-md">
          {/* Primary CTA: Return to Gateway */}
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs sm:text-sm font-mono transition-all duration-200 shadow-[0_4px_20px_rgba(223,178,119,0.25)] hover:shadow-[0_6px_28px_rgba(223,178,119,0.4)] hover:-translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Gateway</span>
          </Link>

          {/* Secondary CTA: Open Console */}
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D0E14] hover:bg-[#151722] border border-[#222533] hover:border-[#383C52] text-neutral-200 hover:text-white font-medium text-xs sm:text-sm font-mono transition-all cursor-pointer shadow-sm"
          >
            <Terminal className="w-4 h-4 text-neutral-400" />
            <span>Open Console</span>
          </Link>
        </div>
      </main>

      {/* Monospace Telemetry Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 border-t border-[#151515] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
        <div>
          Trace ID: <span className="text-neutral-400">0x8f4d92a10c</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <span>Zero Data Persisted</span>
          <span>•</span>
          <span className="text-[#10B981] font-semibold">OsterdOps Firewall Active</span>
        </div>
      </footer>
    </div>
  );
}
