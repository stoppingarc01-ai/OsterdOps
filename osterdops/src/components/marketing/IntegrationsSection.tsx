"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const providers = [
  {
    name: "OpenAI",
    models: "GPT-4o, GPT-4o-mini, and more.",
    status: "connected",
    color: "#22c55e",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    name: "Anthropic",
    models: "Claude 3.5 Sonnet, Haiku, and more.",
    status: "connected",
    color: "#22c55e",
    icon: (
      <div className="text-[28px] font-bold text-white tracking-tighter leading-none">
        A<span className="text-[20px]">I</span>
      </div>
    ),
  },
  {
    name: "Google",
    models: "Gemini 1.5 Pro, Flash, and more.",
    status: "connected",
    color: "#22c55e",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: "Meta",
    models: "Llama 3, Code Llama, and more.",
    status: "coming",
    color: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="#0081FB" className="h-8 w-8">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
      </svg>
    ),
  },
  {
    name: "Mistral AI",
    models: "Mixtral, Mistral Large, and more.",
    status: "coming",
    color: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <rect x="2" y="2" width="6" height="6" fill="#F7D046"/>
        <rect x="9" y="2" width="6" height="6" fill="#F7D046"/>
        <rect x="16" y="2" width="6" height="6" fill="#F7D046"/>
        <rect x="2" y="9" width="6" height="6" fill="#F2A73B"/>
        <rect x="9" y="9" width="6" height="6" fill="#EE792F"/>
        <rect x="16" y="9" width="6" height="6" fill="#F2A73B"/>
        <rect x="2" y="16" width="6" height="6" fill="#EB4C23"/>
        <rect x="9" y="16" width="6" height="6" fill="#EB4C23"/>
        <rect x="16" y="16" width="6" height="6" fill="#EB4C23"/>
      </svg>
    ),
  },
  {
    name: "Cohere",
    models: "Command R+, Embed, and more.",
    status: "coming",
    color: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#39D3A7" strokeWidth="2"/>
        <path d="M7 12a5 5 0 0 1 10 0" fill="none" stroke="#39D3A7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function IntegrationsSection() {
  return (
    <section className="relative w-full bg-[#08090e] py-16 lg:py-20 border-t border-[#1a1d2a]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left text */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#565b72] mb-4">
              Connected Ecosystem
            </p>
            <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.15] tracking-tight text-white mb-4">
              Seamless integrations across AI providers
            </h2>
            <p className="text-[14px] leading-relaxed text-[#7a7e94] mb-6">
              Connect multiple AI models and providers through a single proxy. OsterdOps normalizes, tracks, and optimizes every request.
            </p>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-[#2a2d3e] rounded-lg text-[13px] font-medium text-[#c8cad4] transition-all duration-200 hover:border-[#3a3d4e] hover:text-white">
              View All Integrations
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>

          {/* Right: Provider cards */}
          <motion.div
            className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {providers.map((p) => (
              <motion.div
                key={p.name}
                variants={item}
                className="bg-[#0e1017] border border-[#1e2130] rounded-xl p-5 transition-all duration-300 hover:border-[#2a2d3e] hover:bg-[#111318]"
              >
                <div className="mb-3">{p.icon}</div>
                <h3 className="text-[14px] font-semibold text-white mb-1">
                  {p.name}
                </h3>
                <p className="text-[12px] text-[#7a7e94] mb-3 leading-relaxed">
                  {p.models}
                </p>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      boxShadow: `0 0 6px ${p.color}`,
                    }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: p.color }}
                  >
                    {p.status === "connected" ? "Connected" : "Coming Soon"}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
