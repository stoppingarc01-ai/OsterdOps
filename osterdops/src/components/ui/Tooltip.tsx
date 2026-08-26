"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
};

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-text)] text-[var(--color-text-inverse)] rounded-[var(--radius-md)] whitespace-nowrap shadow-[var(--shadow-md)] pointer-events-none animate-[tooltipIn_0.1s_ease-out]",
            positionStyles[position]
          )}
        >
          {content}
        </div>
      )}

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
