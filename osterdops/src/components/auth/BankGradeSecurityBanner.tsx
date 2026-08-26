"use client";

import React from "react";
import { ShieldCheck, Check } from "lucide-react";

export function BankGradeSecurityBanner() {
  const securityPoints = [
    "SOC 2 Type II Certified",
    "256-bit End-to-End Encryption",
    "Regular Security Audits",
  ];

  return (
    <div className="w-full max-w-[820px] mx-auto mt-10 rounded-2xl bg-[#090b11]/90 border border-[#1d202e] p-5 sm:p-6 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Security Badge & Text */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#dfba82]/15 to-transparent border border-[#dfba82]/40 shrink-0 shadow-[0_0_15px_rgba(223,186,130,0.15)]">
            <ShieldCheck className="h-6 w-6 text-[#dfba82]" />
          </div>
          <div>
            <h4
              className="text-[15px] font-semibold text-[#f4efe6] tracking-tight"
              style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
            >
              Bank-grade security
            </h4>
            <p className="text-[11.5px] text-[#828699] mt-0.5 leading-normal">
              Your data is encrypted and protected with enterprise-grade security.
            </p>
          </div>
        </div>

        {/* Right 3 Checklist Items */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-[11.5px] text-[#c5c8d6]">
          {securityPoints.map((point) => (
            <div key={point} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#dfba82]/20 border border-[#dfba82]/60 flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5 text-[#dfba82] stroke-[3]" />
              </div>
              <span className="font-medium whitespace-nowrap">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
