import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
};

const heightStyles = { sm: "h-1", md: "h-2", lg: "h-3" };

const barVariants = {
  primary: "bg-[var(--color-primary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-[var(--color-bg-muted)] overflow-hidden",
          heightStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            barVariants[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--color-text-muted)] font-medium tabular-nums shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
