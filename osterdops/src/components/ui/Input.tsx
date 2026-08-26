import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border rounded-[var(--radius-md)] transition-colors duration-[var(--transition-fast)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--color-danger)]">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-caption">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
