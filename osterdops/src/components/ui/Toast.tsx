"use client";

import { cn } from "@/lib/utils";
import { createContext, useContext, useCallback, useState, type ReactNode } from "react";

/* ---- Types ---- */
export type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
};

/* ---- Context ---- */
const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/* ---- Provider ---- */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "default", duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---- Toast Item ---- */
const variantStyles: Record<ToastVariant, string> = {
  default: "border-[var(--color-border)]",
  success: "border-[var(--color-success)]",
  warning: "border-[var(--color-warning)]",
  danger: "border-[var(--color-danger)]",
  info: "border-[var(--color-info)]",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[var(--color-bg-elevated)] border-l-4 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] text-sm text-[var(--color-text)] animate-[slideIn_0.2s_ease-out]",
        variantStyles[toast.variant]
      )}
    >
      <span>{toast.message}</span>
      <button
        onClick={onDismiss}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
