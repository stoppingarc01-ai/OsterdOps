"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AccentColorConfig {
  id: string;
  name: string;
  gradient: string;
  primary: string;
  glow: string;
  text: string;
  hover: string;
}

export interface UIThemeConfig {
  id: string;
  name: string;
  bg: string;
  surface: string;
  card: string;
  border: string;
}

export const ACCENT_COLORS: AccentColorConfig[] = [
  {
    id: "purple",
    name: "Purple",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    primary: "#a855f7",
    glow: "rgba(168, 85, 247, 0.22)",
    text: "#c084fc",
    hover: "#c084fc",
  },
  {
    id: "warm-flame",
    name: "Warm Flame",
    gradient: "linear-gradient(135deg, #fb7185 0%, #f97316 50%, #fbbf24 100%)",
    primary: "#fb923c",
    glow: "rgba(251, 146, 60, 0.22)",
    text: "#fdba74",
    hover: "#fed7aa",
  },
  {
    id: "night-fade",
    name: "Night Fade",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)",
    primary: "#c084fc",
    glow: "rgba(192, 132, 252, 0.22)",
    text: "#e9d5ff",
    hover: "#f5d0fe",
  },
  {
    id: "spring-warmth",
    name: "Spring Warmth",
    gradient: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #fb7185 100%)",
    primary: "#f472b6",
    glow: "rgba(244, 114, 182, 0.22)",
    text: "#fbcfe8",
    hover: "#fdf2f8",
  },
  {
    id: "juicy-peach",
    name: "Juicy Peach",
    gradient: "linear-gradient(135deg, #dfba82 0%, #fcd34d 50%, #fbbf24 100%)",
    primary: "#dfba82",
    glow: "rgba(223, 186, 130, 0.22)",
    text: "#dfba82",
    hover: "#ebd5ab",
  },
  {
    id: "young-passion",
    name: "Young Passion",
    gradient: "linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)",
    primary: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.22)",
    text: "#fda4af",
    hover: "#fecdd3",
  },
  {
    id: "lady-lips",
    name: "Lady Lips",
    gradient: "linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)",
    primary: "#ec4899",
    glow: "rgba(236, 72, 153, 0.22)",
    text: "#f9a8d4",
    hover: "#fbcfe8",
  },
  {
    id: "sunny-morning",
    name: "Sunny Morning",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde047 100%)",
    primary: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.22)",
    text: "#fde68a",
    hover: "#fef08a",
  },
  {
    id: "rainy-ashville",
    name: "Rainy Ashville",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)",
    primary: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.22)",
    text: "#93c5fd",
    hover: "#bfdbfe",
  },
];

export const UI_THEMES: UIThemeConfig[] = [
  {
    id: "obsidian",
    name: "Dark Obsidian",
    bg: "#07080c",
    surface: "#0d0f18",
    card: "#0a0c14",
    border: "#1d202e",
  },
  {
    id: "midnight",
    name: "Midnight Slate",
    bg: "#0b0f19",
    surface: "#111726",
    card: "#0d1320",
    border: "#1e293b",
  },
  {
    id: "oled",
    name: "OLED Pure Black",
    bg: "#000000",
    surface: "#080808",
    card: "#050505",
    border: "#1a1a1a",
  },
  {
    id: "cyber",
    name: "Cyber Onyx",
    bg: "#060913",
    surface: "#0c1020",
    card: "#080c18",
    border: "#18223c",
  },
];

interface ThemeCustomizerContextType {
  accent: AccentColorConfig;
  uiTheme: UIThemeConfig;
  setAccent: (accent: AccentColorConfig) => void;
  setUITheme: (theme: UIThemeConfig) => void;
  resetTheme: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(undefined);

function applyDynamicThemeRules(newAccent: AccentColorConfig, newTheme: UIThemeConfig) {
  if (typeof document === "undefined") return;

  // Set CSS Variables
  const root = document.documentElement;
  root.style.setProperty("--color-gold-champagne", newAccent.primary);
  root.style.setProperty("--accent-primary", newAccent.primary);
  root.style.setProperty("--accent-gradient", newAccent.gradient);
  root.style.setProperty("--accent-glow", newAccent.glow);
  root.style.setProperty("--accent-text", newAccent.text);
  root.style.setProperty("--accent-hover", newAccent.hover);

  root.style.setProperty("--db-bg", newTheme.bg);
  root.style.setProperty("--db-surface", newTheme.surface);
  root.style.setProperty("--db-card", newTheme.card);
  root.style.setProperty("--db-border", newTheme.border);

  // Injected CSS Override for all arbitrary gold classes across the app
  let styleEl = document.getElementById("osterdops-dynamic-theme-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "osterdops-dynamic-theme-style";
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    /* Universal Dynamic Accent Color Overrides */
    .text-\\[\\#dfba82\\] { color: ${newAccent.primary} !important; }
    .hover\\:text-\\[\\#dfba82\\]:hover { color: ${newAccent.primary} !important; }
    .group-hover\\:text-\\[\\#dfba82\\] { color: ${newAccent.primary} !important; }
    .group\\/card:hover .group-hover\\/card\\:text-\\[\\#dfba82\\] { color: ${newAccent.primary} !important; }
    .group\\/banner:hover .group-hover\\/banner\\:text-\\[\\#dfba82\\] { color: ${newAccent.primary} !important; }

    .bg-\\[\\#dfba82\\] { background-color: ${newAccent.primary} !important; }
    .hover\\:bg-\\[\\#dfba82\\]:hover { background-color: ${newAccent.hover} !important; }
    .hover\\:bg-\\[\\#ebd5ab\\]:hover { background-color: ${newAccent.hover} !important; }
    .group-hover\\:bg-\\[\\#dfba82\\] { background-color: ${newAccent.primary} !important; }

    .border-\\[\\#dfba82\\] { border-color: ${newAccent.primary} !important; }
    .hover\\:border-\\[\\#dfba82\\]:hover { border-color: ${newAccent.primary} !important; }
    .group-hover\\:border-\\[\\#dfba82\\] { border-color: ${newAccent.primary} !important; }

    /* Opacity variations */
    .bg-\\[\\#dfba82\\]\\/5 { background-color: ${newAccent.glow} !important; }
    .bg-\\[\\#dfba82\\]\\/10 { background-color: ${newAccent.glow} !important; }
    .bg-\\[\\#dfba82\\]\\/15 { background-color: ${newAccent.glow} !important; }
    .bg-\\[\\#dfba82\\]\\/20 { background-color: ${newAccent.glow} !important; }
    .bg-\\[\\#dfba82\\]\\/25 { background-color: ${newAccent.glow} !important; }
    .bg-\\[\\#dfba82\\]\\/30 { background-color: ${newAccent.glow} !important; }

    .border-\\[\\#dfba82\\]\\/20 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/25 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/30 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/40 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/50 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/60 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/70 { border-color: ${newAccent.glow} !important; }
    .border-\\[\\#dfba82\\]\\/80 { border-color: ${newAccent.primary} !important; }
    .hover\\:border-\\[\\#dfba82\\]\\/40:hover { border-color: ${newAccent.primary} !important; }
    .hover\\:border-\\[\\#dfba82\\]\\/50:hover { border-color: ${newAccent.primary} !important; }
    .hover\\:border-\\[\\#dfba82\\]\\/60:hover { border-color: ${newAccent.primary} !important; }

    /* Shadow & Gradient Accents */
    .shadow-\\[0_0_12px_rgba\\(223\\,186\\,130\\,0\\.3\\)\\] { box-shadow: 0 0 16px ${newAccent.glow} !important; }
    .shadow-\\[0_0_15px_rgba\\(223\\,186\\,130\\,0\\.4\\)\\] { box-shadow: 0 0 20px ${newAccent.glow} !important; }
    .shadow-\\[0_0_20px_rgba\\(223\\,186\\,130\\,0\\.3\\)\\] { box-shadow: 0 0 25px ${newAccent.glow} !important; }
    .shadow-\\[0_0_35px_rgba\\(223\\,186\\,130\\,0\\.18\\)\\] { box-shadow: 0 0 35px ${newAccent.glow} !important; }

    /* Custom Cursor Halo */
    .border-\\[\\#dfba82\\]\\/70 { border-color: ${newAccent.primary} !important; }
    .bg-\\[\\#dfba82\\]\\/\\[0\\.08\\] { background-color: ${newAccent.glow} !important; }
  `;
}

export function ThemeCustomizerProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentColorConfig>(() => {
    if (typeof window === "undefined") return ACCENT_COLORS[4];
    try {
      const savedAccentId = localStorage.getItem("osterdops_accent_id");
      if (savedAccentId) {
        const match = ACCENT_COLORS.find((c) => c.id === savedAccentId);
        if (match) return match;
      }
    } catch {}
    return ACCENT_COLORS[4];
  });

  const [uiTheme, setUIThemeState] = useState<UIThemeConfig>(() => {
    if (typeof window === "undefined") return UI_THEMES[0];
    try {
      const savedThemeId = localStorage.getItem("osterdops_ui_theme_id");
      if (savedThemeId) {
        const match = UI_THEMES.find((t) => t.id === savedThemeId);
        if (match) return match;
      }
    } catch {}
    return UI_THEMES[0];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    applyDynamicThemeRules(accent, uiTheme);
  }, [accent, uiTheme]);

  const setAccent = (newAccent: AccentColorConfig) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem("osterdops_accent_id", newAccent.id);
    } catch {}
  };

  const setUITheme = (newTheme: UIThemeConfig) => {
    setUIThemeState(newTheme);
    try {
      localStorage.setItem("osterdops_ui_theme_id", newTheme.id);
    } catch {}
  };

  const resetTheme = () => {
    setAccent(ACCENT_COLORS[4]);
    setUITheme(UI_THEMES[0]);
  };

  return (
    <ThemeCustomizerContext.Provider
      value={{
        accent,
        uiTheme,
        setAccent,
        setUITheme,
        resetTheme,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </ThemeCustomizerContext.Provider>
  );
}

export function useThemeCustomizer() {
  const context = useContext(ThemeCustomizerContext);
  if (!context) {
    throw new Error("useThemeCustomizer must be used within a ThemeCustomizerProvider");
  }
  return context;
}
