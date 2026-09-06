"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  className?: string;
}

/**
 * Dual-variant Theme Switcher supporting both compact icon toggle
 * and expanded segmented control (Light / System / Dark).
 * Fully hydration-safe with zero SSR mismatches.
 */
export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div className={`flex items-center justify-between p-1 rounded-xl bg-slate-100 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] ${className}`}>
          <div className="w-full h-7 rounded-lg bg-slate-200 dark:bg-[#141824]/50 animate-pulse" />
        </div>
      );
    }
    return (
      <button
        type="button"
        className={`p-2 rounded-xl bg-slate-100 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] text-slate-500 dark:text-[#8e93a6] ${className}`}
        aria-label="Loading theme"
        disabled
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  const effectiveTheme = resolvedTheme || theme || "dark";

  if (variant === "segmented") {
    const options = [
      { id: "light", label: "Light", icon: Sun },
      { id: "system", label: "Auto", icon: Laptop },
      { id: "dark", label: "Dark", icon: Moon },
    ] as const;

    return (
      <div
        className={`flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] gap-1 ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#dfba82]/20 text-[#966d2a] dark:text-[#dfba82] border border-[#dfba82]/40 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-[#73788c] hover:text-slate-900 dark:hover:text-[#c5c9d6] hover:bg-slate-200/70 dark:hover:bg-white/[0.04] border border-transparent"
              }`}
              title={`Switch to ${opt.label} theme`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // "icon" variant: cleanly toggle between light and dark based on effective resolved theme
  const cycleNext = effectiveTheme === "dark" ? "light" : "dark";
  const label =
    effectiveTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(cycleNext)}
      className={`p-2 rounded-xl bg-slate-100 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-slate-300 dark:hover:border-[#dfba82]/40 text-slate-700 dark:text-[#8e93a6] hover:text-slate-900 dark:hover:text-[#dfba82] transition-colors cursor-pointer shadow-xs ${className}`}
      aria-label={label}
      title={label}
    >
      {effectiveTheme === "dark" ? (
        <Moon className="w-4 h-4 text-[#dfba82]" />
      ) : (
        <Sun className="w-4 h-4 text-[#b48c48]" />
      )}
    </button>
  );
}
