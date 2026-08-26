"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Theme toggle button — cycles between light, dark, and system.
 * Uses useSyncExternalStore for hydration-safe client detection.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center w-9 h-9 rounded-md"
        aria-label="Toggle theme"
        disabled
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const label =
    theme === "dark" ? "Switch to light mode" : theme === "light" ? "Switch to system" : "Switch to dark mode";

  return (
    <button
      onClick={() => setTheme(next)}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)] focus-visible:outline-2 focus-visible:outline-[var(--ring-color)]"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        /* Moon icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      ) : theme === "light" ? (
        /* Sun icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        /* Monitor icon for system */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )}
    </button>
  );
}
