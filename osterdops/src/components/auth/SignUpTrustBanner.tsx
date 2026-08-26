"use client";

import React from "react";
import { ShieldCheck, CreditCard, RotateCcw } from "lucide-react";

export function SignUpTrustBanner() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "14-day free trial",
      desc: "Explore all features with full access.",
    },
    {
      icon: CreditCard,
      title: "No credit card",
      desc: "Get started instantly no commitment.",
    },
    {
      icon: RotateCcw,
      title: "Cancel anytime",
      desc: "Flexible plans that grow with you.",
    },
  ];

  return (
    <div className="w-full max-w-[820px] mx-auto mt-10 rounded-2xl bg-[#090b11]/90 border border-[#1d202e] p-5 sm:p-6 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x sm:divide-[#1d202e]">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex flex-col items-center text-center ${
                index !== 0 ? "sm:pl-6" : ""
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#dfba82]/15 to-transparent border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82] mb-2.5 shadow-[0_0_12px_rgba(223,186,130,0.12)]">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h4
                className="text-[13.5px] font-semibold text-[#f4efe6] tracking-tight"
                style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
              >
                {item.title}
              </h4>
              <p className="text-[11px] text-[#828699] mt-0.5 leading-snug">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
