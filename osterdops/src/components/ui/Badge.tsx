import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border-muted)]",
  primary:
    "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border-transparent",
  success:
    "bg-[var(--color-success-muted)] text-[var(--color-success)] border-transparent",
  warning:
    "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-transparent",
  danger:
    "bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-transparent",
  info:
    "bg-[var(--color-info-muted)] text-[var(--color-info)] border-transparent",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-full)] border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
