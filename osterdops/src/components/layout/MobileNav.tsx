"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * Mobile sidebar sheet for the dashboard.
 * Rendered only on small screens (lg breakpoint hides it).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay + Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border-muted)] shadow-[var(--shadow-xl)] flex flex-col animate-[slideInLeft_0.2s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] text-xs font-bold">
                  O
                </div>
                <span className="text-heading text-sm">{siteConfig.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-hover)]"
                  aria-label="Close navigation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-6">
              {siteConfig.sidebarNav.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors",
                            isActive
                              ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isActive ? "bg-[var(--color-primary)]" : "bg-[var(--color-text-muted)]"
                            )}
                          />
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
