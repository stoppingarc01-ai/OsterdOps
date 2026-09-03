"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  glowing?: boolean;
}

export function OsterdOpsLogo({
  className = "",
  size = "md",
  showText = true,
  subtitle,
  glowing = true,
}: LogoProps) {
  const pixelSizes = {
    xs: { icon: 20, container: "w-5 h-5", text: "text-xs", sub: "text-[8.5px]" },
    sm: { icon: 26, container: "w-6.5 h-6.5", text: "text-sm", sub: "text-[9.5px]" },
    md: { icon: 34, container: "w-8.5 h-8.5", text: "text-base", sub: "text-[10px]" },
    lg: { icon: 44, container: "w-11 h-11", text: "text-xl", sub: "text-xs" },
    xl: { icon: 60, container: "w-15 h-15", text: "text-2xl", sub: "text-sm" },
  };

  const currentSize = pixelSizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Official Golden Beast Emblem */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${currentSize.container} transition-transform duration-300 group-hover:scale-105`}
        style={{
          filter: glowing
            ? "drop-shadow(0 0 8px rgba(223, 178, 119, 0.35)) drop-shadow(0 0 16px rgba(223, 178, 119, 0.18))"
            : "none",
        }}
      >
        <Image
          src="/osterdops-logo.png"
          alt="OsterdOps Official Emblem"
          width={currentSize.icon}
          height={currentSize.icon}
          priority
          className="object-contain w-full h-full"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight text-white group-hover:text-[#DFB277] transition-colors font-sans ${currentSize.text}`}
          >
            Osterd<span className="text-[#DFB277]">Ops</span>
          </span>
          {subtitle && (
            <span className={`text-neutral-400 font-sans tracking-tight mt-0.5 leading-none ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
