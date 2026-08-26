import { cn } from "@/lib/utils";
import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const sizePx = { sm: 28, md: 36, lg: 48 };

export function Avatar({ src, alt = "", fallback, size = "md", className }: AvatarProps) {
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn(
          "rounded-full object-cover border border-[var(--color-border-muted)]",
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-border-muted)]",
        sizeStyles[size],
        className
      )}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
