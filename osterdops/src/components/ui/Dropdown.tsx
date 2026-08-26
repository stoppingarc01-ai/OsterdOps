"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, type ReactNode } from "react";

type DropdownItem = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export function Dropdown({ trigger, items, align = "left", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1 top-full min-w-[10rem] bg-[var(--color-bg-elevated)] border border-[var(--color-border-muted)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 animate-[fadeIn_0.1s_ease-out]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                item.danger
                  ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
