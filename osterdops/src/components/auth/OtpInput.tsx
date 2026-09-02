"use client";

import React, { useRef, useEffect, useCallback } from "react";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  onComplete?: (code: string) => void;
  className?: string;
  id?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  hasError = false,
  onComplete,
  className = "",
  id = "otp-input",
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of individual characters up to specified length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  // Autofocus first empty or 0th box on initial mount if requested
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleFocus = (index: number) => {
    // Select contents upon focus for easy overwrite
    inputRefs.current[index]?.select();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const cleanChars = rawVal.replace(/\D/g, "");

    if (!cleanChars) {
      // Deletion occurred
      const newDigits = [...digits];
      newDigits[index] = "";
      const updatedValue = newDigits.join("").trimEnd();
      onChange(updatedValue);
      return;
    }

    // Handle single digit input
    const singleDigit = cleanChars[cleanChars.length - 1];
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    const nextValue = newDigits.join("");
    onChange(nextValue);

    // Auto-advance focus to the next input box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }

    // Trigger onComplete callback when all digits are present
    if (nextValue.length === length && !nextValue.includes(" ")) {
      onComplete?.(nextValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!digits[index]) {
        // Current box is empty, retreat to previous box and erase its digit
        if (index > 0) {
          e.preventDefault();
          const newDigits = [...digits];
          newDigits[index - 1] = "";
          onChange(newDigits.join("").trimEnd());
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Current box has content, erase it and stay on current box
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join("").trimEnd());
      }
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
        inputRefs.current[index - 1]?.select();
      }
    } else if (e.key === "ArrowRight") {
      if (index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;

      const pastedData = e.clipboardData.getData("text/plain");
      const cleanDigits = pastedData.replace(/\D/g, "").slice(0, length);

      if (!cleanDigits) return;

      onChange(cleanDigits);

      // Focus the last filled box or the next unfilled box
      const nextFocusIdx = Math.min(cleanDigits.length, length - 1);
      inputRefs.current[nextFocusIdx]?.focus();

      if (cleanDigits.length === length) {
        onComplete?.(cleanDigits);
      }
    },
    [disabled, length, onChange, onComplete]
  );

  return (
    <div
      role="group"
      aria-label="One-Time Verification Code"
      className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}
    >
      {digits.map((digit, index) => {
        const isFilled = Boolean(digit);
        return (
          <input
            key={`otp-slot-${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`${id}-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={disabled}
            onFocus={() => handleFocus(index)}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`
              w-11 h-14 sm:w-12 sm:h-14
              text-center text-xl sm:text-2xl font-mono font-semibold
              bg-[#0A0A0A] text-neutral-100
              border rounded-lg
              transition-all duration-150
              outline-none
              ${
                hasError
                  ? "border-red-500/80 text-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  : isFilled
                  ? "border-[#333333] text-white"
                  : "border-[#262626] text-neutral-400"
              }
              ${
                !hasError &&
                "focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30"
              }
              ${disabled ? "opacity-40 cursor-not-allowed bg-neutral-950" : "hover:border-neutral-700"}
            `}
          />
        );
      })}
    </div>
  );
}
