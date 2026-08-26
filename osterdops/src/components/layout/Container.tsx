import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const maxWidths = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({ children, size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidths[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
