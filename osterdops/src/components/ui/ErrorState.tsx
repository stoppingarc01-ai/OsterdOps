"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-900/20 border border-red-700/30 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-200 mb-1.5">{title}</h3>
      <p className="text-sm text-red-400/80 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-900/40 border border-red-700/50 text-red-200 hover:bg-red-900/60 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
