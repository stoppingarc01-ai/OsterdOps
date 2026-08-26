import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  spacing?: "sm" | "md" | "lg";
};

const spacingStyles = {
  sm: "py-8 sm:py-12",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
};

export function Section({ children, spacing = "md", className, ...props }: SectionProps) {
  return (
    <section className={cn(spacingStyles[spacing], className)} {...props}>
      {children}
    </section>
  );
}
