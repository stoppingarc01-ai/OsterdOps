import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
};

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--color-bg-muted)]",
        variant === "text" && "h-4 rounded-[var(--radius-sm)]",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-[var(--radius-md)]",
        className
      )}
      style={{ width, height }}
      aria-hidden
    />
  );
}
