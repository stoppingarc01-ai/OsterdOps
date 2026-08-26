import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]",
  secondary:
    "bg-[var(--color-bg-muted)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-surface-active)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 active:opacity-80",
  outline:
    "bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)] focus-visible:outline-2 focus-visible:outline-[var(--ring-color)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
