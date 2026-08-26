"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

type Tab = {
  label: string;
  value: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
};

export function Tabs({ tabs, defaultValue, className, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0]?.value || "");

  const handleChange = (value: string) => {
    setActive(value);
    onChange?.(value);
  };

  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex border-b border-[var(--color-border-muted)] gap-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={tab.value === active}
            onClick={() => !tab.disabled && handleChange(tab.value)}
            disabled={tab.disabled}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
              tab.value === active
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {tab.label}
            {tab.value === active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-primary)] rounded-full" />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  );
}
