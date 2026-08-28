"use client";

import React from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../types";

interface StepConnectDataProps {
  data: OnboardingData;
  onChange: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AIProviderItem {
  id: string;
  name: string;
  logo: React.ReactNode;
}

const PROVIDERS: AIProviderItem[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: (
      <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7944.7944 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zM3.6 18.304a4.4707 4.4707 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7707.7707 0 0 0 .7855 0l5.8333-3.3685v2.332a.0804.0804 0 0 1-.0332.0615L9.74 19.9503A4.4992 4.4992 0 0 1 3.6 18.304zm-1.5011-9.54a4.4849 4.4849 0 0 1 2.3413-1.9748v5.6773a.7802.7802 0 0 0 .3927.6813l5.8334 3.3685-2.02 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7914A4.4992 4.4992 0 0 1 2.0989 8.764zM18.9 10.625l-4.783-2.7582a.7707.7707 0 0 0-.7855 0L7.498 11.2353V8.9033a.0804.0804 0 0 1 .0332-.0615l4.8351-2.7914a4.504 4.504 0 0 1 6.6746 4.636l-.1409-.0614zm2.9982 4.6114a4.4849 4.4849 0 0 1-2.3413 1.9748v-5.6773a.7802.7802 0 0 0-.3927-.6813L13.3308 7.4842l2.02-1.1683a.0757.0757 0 0 1 .071 0l4.8303 2.7914a4.4992 4.4992 0 0 1 1.6461 6.1291zM10.74 14.3417l-2.02-1.1683a.0757.0757 0 0 1-.038-.052V7.5385a4.504 4.504 0 0 1 7.3709-3.4539l-.1419.0804-4.7783 2.7582a.7944.7944 0 0 0-.3927.6813v6.7369z" />
      </svg>
    ),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: (
      <div className="text-white font-serif font-black text-xl tracking-tighter">
        AI
      </div>
    ),
  },
  {
    id: "gemini",
    name: "Google Gemini",
    logo: (
      <svg className="w-6 h-6 text-[#93c5fd]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" />
      </svg>
    ),
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    logo: (
      <svg className="w-6 h-6 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 19h5.5l3.5-7.5L15.5 19H21L12 2z" />
      </svg>
    ),
  },
  {
    id: "aws",
    name: "AWS Bedrock",
    logo: (
      <div className="text-amber-400 font-sans font-bold text-xs tracking-tight">
        aws
      </div>
    ),
  },
  {
    id: "other",
    name: "Other",
    logo: (
      <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#787d91] flex items-center justify-center text-[10px] font-mono text-[#a2a7b8]">
        •••
      </div>
    ),
  },
];

export function StepConnectData({
  data,
  onChange,
  onNext,
  onBack,
}: StepConnectDataProps) {
  const toggleProvider = (id: string) => {
    const isConnected = data.connectedProviders.includes(id);
    const updated = isConnected
      ? data.connectedProviders.filter((p) => p !== id)
      : [...data.connectedProviders, id];
    onChange({ connectedProviders: updated });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        <h2
          className="text-[28px] sm:text-[32px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Connect your AI infrastructure.
        </h2>
        <p className="text-[13.5px] text-[#8e93a6]">
          Connect the providers and services your team already uses.
        </p>
      </motion.div>

      {/* Integration Provider Grid (3x2) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {PROVIDERS.map((provider) => {
          const isConnected = data.connectedProviders.includes(provider.id);

          return (
            <div
              key={provider.id}
              onClick={() => toggleProvider(provider.id)}
              className={`p-4 bg-[#0d0f18] border rounded-2xl flex flex-col justify-between min-h-[110px] cursor-pointer transition-all duration-200 group ${
                isConnected
                  ? "border-[#dfba82] bg-[#dfba82]/[0.05] shadow-[0_0_20px_rgba(223,186,130,0.12)]"
                  : "border-[#1d202e] hover:border-[#383d54] hover:bg-[#121522]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center shrink-0">
                  {provider.logo}
                </div>
                <div className="font-medium text-[13.5px] text-white tracking-tight">
                  {provider.name}
                </div>
              </div>

              {/* Status Action / Badge */}
              <div className="mt-3 flex items-center justify-end">
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dfba82]/20 border border-[#dfba82]/40 text-[#dfba82] text-[11px] font-semibold">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#8e93a6] group-hover:text-white transition-colors">
                    Connect
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Footer hint */}
      <p className="text-[12px] text-[#6e7387]">
        You can add more integrations later.
      </p>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#c5c9d6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(223,186,130,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
