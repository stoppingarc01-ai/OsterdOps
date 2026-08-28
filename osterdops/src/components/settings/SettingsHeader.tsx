"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Bell, Palette, Check } from "lucide-react";
import { useThemeCustomizer } from "@/context/ThemeCustomizerContext";

const PROJECT_OPTIONS = [
  "All Projects",
  "Production AI Gateway",
  "Customer Support Bot",
  "LLM Eval Pipeline",
  "Financial Analytics Model",
];

export function SettingsHeader() {
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);
  const { accent, setIsModalOpen } = useThemeCustomizer();

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
      {/* Title & Subtitle */}
      <div>
        <h1
          className="text-2xl sm:text-[28px] font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Settings
        </h1>
        <p className="text-[13px] text-[#8e93a6] mt-0.5">
          Manage your organization, preferences and integrations.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Customize Theme Quick Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-xs font-semibold text-[#dfba82] hover:text-white transition-all cursor-pointer shadow-xs"
          title="Customize Theme & Accent Color"
        >
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
            style={{ background: accent.gradient }}
          />
          <span>Theme: {accent.name}</span>
          <Palette className="w-3.5 h-3.5 ml-0.5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12.5px] font-medium text-[#e8eaf0] transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedProject}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 p-1.5 bg-[#0d0f18] border border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              {PROJECT_OPTIONS.map((proj) => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => {
                    setSelectedProject(proj);
                    setIsProjectMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedProject === proj
                      ? "bg-[#dfba82]/15 text-[#dfba82] font-semibold"
                      : "text-[#c5c9d6] hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{proj}</span>
                  {selectedProject === proj && (
                    <Check className="w-3.5 h-3.5 text-[#dfba82]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setHasUnreadAlerts(!hasUnreadAlerts)}
            className="w-9 h-9 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-white flex items-center justify-center transition-colors relative cursor-pointer shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadAlerts && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#dfba82] text-[#07080c] font-bold text-[9.5px] flex items-center justify-center border border-[#07080c] shadow-xs">
                3
              </span>
            )}
          </button>
        </div>

        {/* User Avatar Pill */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#dfba82]/25 to-[#b8860b]/35 border border-[#dfba82]/40 text-[#dfba82] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer select-none">
          SP
        </div>
      </div>
    </header>
  );
}
