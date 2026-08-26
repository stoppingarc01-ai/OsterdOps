"use client";

import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
  type: "sign-in" | "sign-up";
}

export function AuthHeader({ type }: AuthHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-6 px-6 sm:px-10 max-w-7xl mx-auto">
      {/* Left: Brand Logo with Shield & Subtitle */}
      <Link href="/" className="flex items-center gap-3 group">
        {/* Golden Shield Logo */}
        <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-b from-[#dfba82]/20 to-[#0d0f15] border border-[#dfba82]/50 shadow-[0_0_15px_rgba(223,186,130,0.25)] group-hover:border-[#dfba82] transition-colors">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#dfba82]"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeWidth="2.2" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span
            className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[#f4efe6] leading-none"
            style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
          >
            OsterdOps
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#dfba82] tracking-wide mt-1 opacity-90">
            AI Cost Governance
          </span>
        </div>
      </Link>

      {/* Right Header Text / Link */}
      <div className="text-right text-[12.5px] sm:text-[13px]">
        {type === "sign-in" ? (
          <div className="text-[#8e93a6] leading-tight hidden sm:block">
            <span className="block font-medium text-[#c5c8d6]">Control. Optimize. Scale.</span>
            <span className="text-[11.5px] text-[#6b7185]">AI spend with confidence.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#9da1b2]">
            <span>Already have an account?</span>
            <Link
              href="/sign-in"
              className="font-semibold text-[#dfba82] hover:text-[#faeedb] transition-colors underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
