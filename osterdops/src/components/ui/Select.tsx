import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border rounded-[var(--radius-md)] transition-colors duration-[var(--transition-fast)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat",
            error
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
          }}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
        {hint && !error && <p className="text-caption">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
