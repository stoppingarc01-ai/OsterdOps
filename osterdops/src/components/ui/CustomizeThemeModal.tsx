"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  X,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Moon,
} from "lucide-react";
import {
  useThemeCustomizer,
  ACCENT_COLORS,
  UI_THEMES,
} from "@/context/ThemeCustomizerContext";

export function CustomizeThemeModal() {
  const {
    accent,
    uiTheme,
    setAccent,
    setUITheme,
    resetTheme,
    isModalOpen,
    setIsModalOpen,
  } = useThemeCustomizer();

  const [activeTab, setActiveTab] = useState<"uiTheme" | "accentColor">("accentColor");

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-[380px] bg-[#11131a] border border-[#232738] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(0,0,0,0.5)] overflow-hidden text-white font-sans relative">
        {/* Top Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#1b1f2e]">
          <h3 className="text-base font-bold text-white tracking-tight">Customize Theme</h3>

          <div className="flex items-center gap-1.5">
            {/* Reset Button */}
            <button
              type="button"
              onClick={resetTheme}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181b28] hover:bg-[#23273a] text-[#8e93a6] hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1 rounded-lg text-[#787d91] hover:text-white hover:bg-[#181b28] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: [ UI Theme ] [ Accent Color ] */}
        <div className="p-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-[#181b28] rounded-2xl border border-[#232738] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("uiTheme")}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "uiTheme"
                  ? "bg-[#252a3d] text-white shadow-sm"
                  : "text-[#8e93a6] hover:text-white"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>UI Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("accentColor")}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "accentColor"
                  ? "bg-[#252a3d] text-white shadow-sm"
                  : "text-[#8e93a6] hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Accent Color</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Accent Color Grid (3x3 matching screenshot) */}
        {activeTab === "accentColor" && (
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
              {ACCENT_COLORS.map((c) => {
                const isSelected = accent.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccent(c)}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    {/* Circle Swatch */}
                    <div
                      className={`w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center relative ${
                        isSelected
                          ? "ring-4 ring-[#2d3248] ring-offset-2 ring-offset-[#11131a] scale-105 shadow-lg"
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                      style={{
                        background: c.gradient,
                      }}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isSelected ? "text-white font-bold" : "text-[#8e93a6] group-hover:text-white"
                      }`}
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Live Preview Box */}
            <div className="p-3.5 bg-[#181b28] border border-[#262b3d] rounded-2xl flex items-center gap-3.5 shadow-inner">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
                style={{ background: accent.gradient }}
              >
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Live preview</div>
                <div className="text-[11px] text-[#8e93a6]">
                  Buttons and highlights use this gradient
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: UI Theme Mode */}
        {activeTab === "uiTheme" && (
          <div className="p-5 space-y-3">
            <div className="space-y-2.5">
              {UI_THEMES.map((theme) => {
                const isSelected = uiTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setUITheme(theme)}
                    className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#1c2030] border-[#dfba82]/80 text-white shadow-md"
                        : "bg-[#141724] border-[#202436] hover:border-[#dfba82]/30 text-[#c5c9d6]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg border border-[#2d3248] shadow-inner"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span className="text-xs font-semibold">{theme.name}</span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#dfba82] text-[#07080c] flex items-center justify-center font-bold text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Info Box */}
            <div className="p-3.5 bg-[#181b28] border border-[#262b3d] rounded-2xl flex items-center gap-3 shadow-inner mt-4">
              <Sparkles className="w-4 h-4 text-[#dfba82] shrink-0" />
              <p className="text-[11px] text-[#8e93a6] leading-snug">
                Adjusts background canvas, card elevation, and border shades across the entire dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
