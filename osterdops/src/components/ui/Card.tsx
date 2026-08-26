import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg" | "none";
  hoverable?: boolean;
  children: ReactNode;
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ padding = "md", hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] border border-[var(--color-border-muted)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] transition-all duration-[var(--transition-base)]",
        hoverable && "hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border)]",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-heading text-base", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-caption", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 flex items-center gap-3 pt-4 border-t border-[var(--color-border-muted)]", className)} {...props}>
      {children}
    </div>
  );
}
