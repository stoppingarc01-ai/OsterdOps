"use client";

import { cn } from "@/lib/utils";
import { useEffect, useCallback, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        className={cn(
          "relative w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-muted)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] p-6 animate-[scaleIn_0.15s_ease-out]",
          sizeStyles[size],
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <h2 id="modal-title" className="text-heading text-lg mb-1 pr-8">
            {title}
          </h2>
        )}
        {description && (
          <p id="modal-desc" className="text-body text-sm mb-4">
            {description}
          </p>
        )}

        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
