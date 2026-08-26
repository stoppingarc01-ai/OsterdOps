"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-lg",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] text-xs font-bold tracking-tight transition-transform group-hover:scale-105">
              O
            </div>
            <span className="text-heading text-base tracking-tight">{siteConfig.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Dashboard
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)]">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-2 text-sm font-medium text-center bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
