"use client";

import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[#1a1d2e] bg-[#0c0e17]/60 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#161928] border border-[#24283b] flex items-center justify-center text-[#dfba82] mb-4 shadow-[0_0_15px_rgba(223,186,130,0.1)]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#f4efe6] mb-1.5">{title}</h3>
      <p className="text-sm text-[#82889e] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#dfba82] to-[#b8860b] text-black hover:opacity-90 transition-all shadow-[0_0_15px_rgba(223,186,130,0.2)] cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
