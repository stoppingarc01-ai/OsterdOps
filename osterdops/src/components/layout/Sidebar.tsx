"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)] h-full overflow-y-auto",
        className
      )}
    >
      {/* Logo bar */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--color-border-muted)] shrink-0">
        <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] text-xs font-bold">
          O
        </div>
        <span className="text-heading text-sm tracking-tight">{siteConfig.name}</span>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-6">
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors",
                      isActive
                        ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    )}
                  >
                    {/* Icon placeholder dot — will be replaced by icon library */}
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
    </aside>
  );
}
