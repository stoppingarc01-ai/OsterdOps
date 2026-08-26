"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function OsterdOpsLogo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textClasses = {
    sm: "text-[13px]",
    md: "text-[16px]",
    lg: "text-[20px]",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Concentric Golden Ring Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-[1.75px] border-[#dfba82]/90 shadow-[0_0_12px_rgba(223,186,130,0.35)]" />
        {/* Inner ring */}
        <div className="h-[52%] w-[52%] rounded-full border-[1.25px] border-[#dfba82]/70 bg-gradient-to-tr from-[#dfba82]/20 to-transparent" />
      </div>

      {showText && (
        <span
          className={`font-medium tracking-tight text-[#f4efe6] transition-colors ${textClasses[size]}`}
          style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
        >
          OsterdOps
        </span>
      )}
    </div>
  );
}
