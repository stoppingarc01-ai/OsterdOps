"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Sparkles, Crosshair, Flame, Disc, Sliders, ChevronDown, Check, Zap } from "lucide-react";

export type CursorStyle = "cyber-hud" | "golden-aura" | "quantum-comet" | "minimal";

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

interface TrailNode {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverType, setHoverType] = useState<string>("default");
  const [hoverLabel, setHoverLabel] = useState<string>("");
  const [cursorStyle, setCursorStyle] = useState<CursorStyle>("cyber-hud");
  const [showParticles, setShowParticles] = useState(true);
  const [showHudBadge, setShowHudBadge] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [trail, setTrail] = useState<TrailNode[]>([]);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // High-precision smooth spring physics
  const springConfig = { damping: 28, stiffness: 380, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const trailCounter = useRef(0);
  const particleCounter = useRef(0);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem("osterdops_cursor_style") as CursorStyle | null;
      if (savedStyle) setCursorStyle(savedStyle);

      const savedParticles = localStorage.getItem("osterdops_cursor_particles");
      if (savedParticles !== null) setShowParticles(savedParticles === "true");

      const savedHud = localStorage.getItem("osterdops_cursor_hud");
      if (savedHud !== null) setShowHudBadge(savedHud === "true");
    } catch {
      // ignore localStorage errors in restricted environments
    }
  }, []);

  const handleStyleChange = (style: CursorStyle) => {
    setCursorStyle(style);
    try {
      localStorage.setItem("osterdops_cursor_style", style);
    } catch {}
  };

  const toggleParticles = () => {
    const next = !showParticles;
    setShowParticles(next);
    try {
      localStorage.setItem("osterdops_cursor_particles", String(next));
    } catch {}
  };

  const toggleHudBadge = () => {
    const next = !showHudBadge;
    setShowHudBadge(next);
    try {
      localStorage.setItem("osterdops_cursor_hud", String(next));
    } catch {}
  };

  useEffect(() => {
    // Only activate custom cursor on non-touch pointer devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let lastTrailTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mouseX.set(x);
      mouseY.set(y);
      setCoords({ x, y });

      if (!isVisible) setIsVisible(true);

      // Trailing dust particles
      const now = performance.now();
      if (showParticles && now - lastTrailTime > 30) {
        lastTrailTime = now;
        trailCounter.current += 1;
        const newNode: TrailNode = {
          id: trailCounter.current,
          x,
          y,
          opacity: 0.6,
          scale: 1,
        };
        setTrail((prev) => [...prev.slice(-10), newNode]);
      }

      // Contextual detection of interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable = target.closest(
          "button, a, input, select, textarea, [role='button'], .cursor-pointer, [data-interactive]"
        ) as HTMLElement | null;

        if (clickable) {
          setIsPointer(true);
          const tag = clickable.tagName.toLowerCase();
          const role = clickable.getAttribute("role");
          const text = clickable.textContent?.trim() || "";

          if (tag === "input" || tag === "textarea") {
            setHoverType("input");
            setHoverLabel("EDIT ✍");
          } else if (tag === "a" || clickable.closest("nav")) {
            setHoverType("link");
            setHoverLabel("NAVIGATE ↗");
          } else if (clickable.getAttribute("data-action") === "copy") {
            setHoverType("copy");
            setHoverLabel("COPY 📋");
          } else if (text.toLowerCase().includes("upgrade") || text.toLowerCase().includes("pricing")) {
            setHoverType("gold");
            setHoverLabel("PRO TIER ✨");
          } else if (text.toLowerCase().includes("download") || text.toLowerCase().includes("pdf")) {
            setHoverType("download");
            setHoverLabel("DOWNLOAD ⚡");
          } else {
            setHoverType("action");
            setHoverLabel("EXECUTE ⚡");
          }
        } else {
          setIsPointer(false);
          setHoverType("default");
          setHoverLabel("");
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      // Kinetic spark explosions
      if (showParticles) {
        const count = 8;
        const newParticles: ClickParticle[] = [];
        for (let i = 0; i < count; i++) {
          particleCounter.current += 1;
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
          newParticles.push({
            id: particleCounter.current,
            x: e.clientX,
            y: e.clientY,
            angle,
            speed: 2 + Math.random() * 3.5,
            size: 2.5 + Math.random() * 2,
            color: Math.random() > 0.4 ? "#dfba82" : "#f3ebd9",
          });
        }
        setParticles((prev) => [...prev.slice(-16), ...newParticles]);
      }
    };

    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY, showParticles]);

  // Particle explosion animator loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed,
            size: Math.max(0, p.size - 0.15),
            speed: p.speed * 0.94,
          }))
          .filter((p) => p.size > 0.4)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  // Trail decay loop
  useEffect(() => {
    if (trail.length === 0) return;
    const interval = setInterval(() => {
      setTrail((prev) =>
        prev
          .map((t) => ({
            ...t,
            opacity: t.opacity - 0.08,
            scale: t.scale * 0.92,
          }))
          .filter((t) => t.opacity > 0.05)
      );
    }, 32);
    return () => clearInterval(interval);
  }, [trail]);

  if (!isVisible) return null;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. CUSTOM CURSOR GRAPHICS LAYER (Fixed Fullscreen Overlay)      */}
      {/* ============================================================== */}
      <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden hidden md:block select-none">
        {/* Kinetic Stardust Particles Trail */}
        {showParticles &&
          trail.map((node) => (
            <div
              key={node.id}
              className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#dfba82] pointer-events-none blur-[0.5px]"
              style={{
                transform: `translate3d(${node.x - 3}px, ${node.y - 3}px, 0) scale(${node.scale})`,
                opacity: node.opacity * 0.4,
                boxShadow: "0 0 8px rgba(223, 186, 130, 0.6)",
              }}
            />
          ))}

        {/* Click Shockwave Burst Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="fixed top-0 left-0 rounded-full pointer-events-none"
            style={{
              transform: `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0)`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}

        {/* Shockwave Expanding Ring on Click */}
        <AnimatePresence>
          {isClicking && (
            <motion.div
              key="shockwave"
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed top-0 left-0 w-10 h-10 rounded-full border border-[#dfba82] pointer-events-none"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
                boxShadow: "0 0 15px rgba(223, 186, 130, 0.5)",
              }}
            />
          )}
        </AnimatePresence>

        {/* ========================================================== */}
        {/* STYLE 1: CYBER HUD MATRIX (Futuristic Crosshairs + Brackets) */}
        {/* ========================================================== */}
        {cursorStyle === "cyber-hud" && (
          <>
            {/* Trailing Outer Orbit Ring with Dynamic Reticle Brackets */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none flex items-center justify-center"
              style={{
                x: smoothX,
                y: smoothY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                width: isPointer ? 54 : isClicking ? 24 : 36,
                height: isPointer ? 54 : isClicking ? 24 : 36,
                rotate: isPointer ? 90 : 0,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
            >
              {/* Concentric Halo Background */}
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${
                  isPointer
                    ? "bg-[#dfba82]/15 border border-[#dfba82]/80 shadow-[0_0_25px_rgba(223,186,130,0.45)] backdrop-blur-[1px]"
                    : "bg-[#dfba82]/[0.05] border border-[#dfba82]/40 shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                }`}
              />

              {/* Futuristic Corner Reticle Brackets [ ] */}
              {isPointer && (
                <>
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#dfba82] rounded-tl-xs" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#dfba82] rounded-tr-xs" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#dfba82] rounded-bl-xs" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#dfba82] rounded-br-xs" />
                </>
              )}
            </motion.div>

            {/* Precision Laser Center Dot */}
            <motion.div
              className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#dfba82] pointer-events-none shadow-[0_0_10px_#dfba82,0_0_20px_rgba(223,186,130,0.8)]"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                scale: isClicking ? 1.8 : isPointer ? 0.6 : 1,
              }}
              transition={{ duration: 0.12 }}
            />

            {/* Contextual Telemetry Micro-HUD Badge */}
            {showHudBadge && (
              <motion.div
                className="fixed top-0 left-0 pointer-events-none flex items-center gap-1.5 pl-5 pt-3"
                style={{
                  x: smoothX,
                  y: smoothY,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{ duration: 0.15 }}
              >
                <div className="px-2 py-0.5 rounded-md bg-[#0a0c14]/90 border border-[#dfba82]/40 shadow-lg backdrop-blur-md flex items-center gap-1 text-[9.5px] font-mono font-bold text-[#dfba82]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{hoverLabel || `${coords.x},${coords.y}`}</span>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* ========================================================== */}
        {/* STYLE 2: LUXURY GOLDEN AURA (Fluid Liquid Orb)             */}
        {/* ========================================================== */}
        {cursorStyle === "golden-aura" && (
          <>
            <motion.div
              className="fixed top-0 left-0 rounded-full pointer-events-none"
              style={{
                x: smoothX,
                y: smoothY,
                translateX: "-50%",
                translateY: "-50%",
                background: "radial-gradient(circle, rgba(223,186,130,0.35) 0%, rgba(223,186,130,0.08) 60%, transparent 80%)",
                boxShadow: "0 0 35px rgba(223, 186, 130, 0.4)",
              }}
              animate={{
                width: isPointer ? 64 : isClicking ? 28 : 44,
                height: isPointer ? 64 : isClicking ? 28 : 44,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            />

            <motion.div
              className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#dfba82] to-amber-200 pointer-events-none shadow-[0_0_12px_#dfba82]"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                scale: isClicking ? 1.6 : isPointer ? 1.3 : 1,
              }}
            />
          </>
        )}

        {/* ========================================================== */}
        {/* STYLE 3: QUANTUM COMET (Electric Spark + Arc)              */}
        {/* ========================================================== */}
        {cursorStyle === "quantum-comet" && (
          <>
            <motion.div
              className="fixed top-0 left-0 rounded-full border-2 border-dashed border-[#dfba82] pointer-events-none"
              style={{
                x: smoothX,
                y: smoothY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                width: isPointer ? 50 : 34,
                height: isPointer ? 50 : 34,
                rotate: 360,
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 6, ease: "linear" },
                width: { duration: 0.2 },
                height: { duration: 0.2 },
              }}
            />

            <motion.div
              className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#f3ebd9] pointer-events-none shadow-[0_0_15px_#dfba82]"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
            />
          </>
        )}

        {/* ========================================================== */}
        {/* STYLE 4: MINIMAL EXECUTIVE (Ultra-Clean Precision Dot)     */}
        {/* ========================================================== */}
        {cursorStyle === "minimal" && (
          <>
            <motion.div
              className="fixed top-0 left-0 rounded-full border border-[#dfba82]/50 bg-[#dfba82]/5 pointer-events-none"
              style={{
                x: smoothX,
                y: smoothY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                width: isPointer ? 38 : 22,
                height: isPointer ? 38 : 22,
              }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
            />
            <motion.div
              className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#dfba82] pointer-events-none"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
            />
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. CURSOR CONTROL WIDGET (Floating Sleek HUD Switcher Pill)    */}
      {/* ============================================================== */}
      <div className="fixed bottom-5 right-5 z-40 hidden md:block font-sans text-xs">
        <div className="relative">
          {/* Main Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c0e17]/90 hover:bg-[#141824] border border-[#1e2338] hover:border-[#dfba82]/60 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer group"
            title="Customize Cursor & Aesthetic Effects"
          >
            <div className="w-4 h-4 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center text-[#dfba82] text-[10px] group-hover:rotate-45 transition-transform duration-300">
              <Crosshair className="w-2.5 h-2.5" />
            </div>
            <span className="font-mono text-[11px] text-[#c5c9d6] group-hover:text-white font-medium">
              Cursor UI
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#8e93a6] transition-transform duration-200 ${
                isMenuOpen ? "rotate-180 text-[#dfba82]" : ""
              }`}
            />
          </button>

          {/* Expandable Customization Dropdown Panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.16 }}
                className="absolute bottom-11 right-0 w-64 p-3 rounded-2xl bg-[#0c0e17] border border-[#1e2338] shadow-2xl backdrop-blur-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#171a28] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Sliders className="w-3.5 h-3.5 text-[#dfba82]" />
                    <span>Cursor Aesthetics</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#dfba82]/10 text-[#dfba82] text-[9.5px] font-mono font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Style Selector Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#73788c] font-semibold">
                    Select Mode:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "cyber-hud", name: "Cyber HUD", icon: Crosshair },
                      { id: "golden-aura", name: "Gold Aura", icon: Disc },
                      { id: "quantum-comet", name: "Quantum", icon: Flame },
                      { id: "minimal", name: "Minimal", icon: Sparkles },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleStyleChange(mode.id as CursorStyle)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          cursorStyle === mode.id
                            ? "bg-[#dfba82]/15 border-[#dfba82] text-white shadow-sm"
                            : "bg-[#111422] border-[#1b1f32] text-[#8e93a6] hover:text-white hover:border-[#2a304e]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <mode.icon className={`w-3.5 h-3.5 ${cursorStyle === mode.id ? "text-[#dfba82]" : ""}`} />
                          <span className="text-[11px] font-medium">{mode.name}</span>
                        </div>
                        {cursorStyle === mode.id && <Check className="w-3 h-3 text-[#dfba82]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="pt-2 border-t border-[#171a28] space-y-2">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-[11px] text-[#c5c9d6] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#dfba82]" />
                      <span>Spark Dust Trail</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showParticles}
                      onChange={toggleParticles}
                      className="w-3.5 h-3.5 accent-[#dfba82] cursor-pointer rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-[11px] text-[#c5c9d6] flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-[#dfba82]" />
                      <span>Telemetry HUD Badge</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showHudBadge}
                      onChange={toggleHudBadge}
                      className="w-3.5 h-3.5 accent-[#dfba82] cursor-pointer rounded"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
