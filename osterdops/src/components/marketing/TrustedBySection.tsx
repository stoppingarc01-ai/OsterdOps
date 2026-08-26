"use client";

import React from "react";
import { motion } from "framer-motion";

const brands = [
  {
    name: "Acme Corp",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-[#c5c8d6]">
        <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
      </svg>
    ),
  },
  {
    name: "Novus",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5 text-[#c5c8d6]">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      </svg>
    ),
  },
  {
    name: "Synthflow",
    icon: (
      <div className="h-5 w-5 rounded bg-white/10 flex items-center justify-center font-bold text-[11px] text-white">
        S
      </div>
    ),
  },
  {
    name: "Pixelon",
    icon: (
      <div className="h-5 w-5 rounded-sm border border-white/30 flex items-center justify-center font-black text-[10px] text-white">
        P
      </div>
    ),
  },
  {
    name: "Toolly",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-[#c5c8d6]">
        <path d="M4 4h16v4H14v12h-4V8H4V4z" />
      </svg>
    ),
  },
  {
    name: "LangBase",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5 text-[#c5c8d6]">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18" />
      </svg>
    ),
  },
];

export function TrustedBySection() {
  return (
    <div className="w-full py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#63687d] mb-7">
          TRUSTED BY INNOVATIVE TEAMS
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-75 hover:opacity-100 transition-opacity">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-2 text-[#9da1b2] hover:text-white transition-colors cursor-default"
            >
              {brand.icon}
              <span className="text-[14px] font-semibold tracking-tight text-[#c5c8d6]">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
