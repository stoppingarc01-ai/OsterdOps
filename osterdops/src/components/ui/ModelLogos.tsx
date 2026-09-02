"use client";

import React from "react";

export interface LogoProps {
  className?: string;
  size?: number;
}

export function OpenAILogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

export function AnthropicLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13.827 3.5h3.693l6.48 17h-3.693l-1.637-4.307h-7.38l-1.637 4.307H5.96L12.44 3.5h1.387zm4.307 9.886l-2.653-6.98-2.653 6.98h5.306zM3.48 20.5L0 3.5h3.693l2.36 12.027L7.4 3.5h3.693l-3.48 17H3.48z" />
    </svg>
  );
}

export function GoogleGeminiLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z" />
    </svg>
  );
}

export function AWSBedrockLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function MetaLlamaLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.0003 7.82843C10.5186 5.51336 8.44146 4 6.10427 4C2.73278 4 0 7.13401 0 11C0 14.866 2.73278 18 6.10427 18C8.44146 18 10.5186 16.4866 12.0003 14.1716C13.4819 16.4866 15.5591 18 17.8963 18C21.2678 18 24 14.866 24 11C24 7.13401 21.2678 4 17.8963 4C15.5591 4 13.4819 5.51336 12.0003 7.82843ZM6.10427 15.6C4.06208 15.6 2.4069 13.5392 2.4069 11C2.4069 8.46083 4.06208 6.4 6.10427 6.4C7.79446 6.4 9.38883 7.78167 10.4578 9.77167C10.6015 10.0383 10.6015 10.3617 10.4578 10.6283C9.38883 12.6183 7.79446 15.6 6.10427 15.6ZM17.8963 15.6C16.2061 15.6 14.6117 12.6183 13.5428 10.6283C13.3991 10.3617 13.3991 10.0383 13.5428 9.77167C14.6117 7.78167 16.2061 6.4 17.8963 6.4C19.9385 6.4 21.5937 8.46083 21.5937 11C21.5937 13.5392 19.9385 15.6 17.8963 15.6Z" />
    </svg>
  );
}

export function GroqLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13.5 2L3 14h8v8l10-12h-7.5l0-8z" />
    </svg>
  );
}

export function MistralLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect x="2" y="3" width="4" height="4" rx="0.5" />
      <rect x="18" y="3" width="4" height="4" rx="0.5" />
      <rect x="6" y="7" width="4" height="4" rx="0.5" />
      <rect x="14" y="7" width="4" height="4" rx="0.5" />
      <rect x="10" y="11" width="4" height="4" rx="0.5" />
      <rect x="6" y="15" width="4" height="4" rx="0.5" />
      <rect x="14" y="15" width="4" height="4" rx="0.5" />
      <rect x="2" y="19" width="4" height="4" rx="0.5" />
      <rect x="18" y="19" width="4" height="4" rx="0.5" />
    </svg>
  );
}

export function AzureLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13.05 2.18L6.2 14.37h5.13L4 21.82h14.88l-5.83-19.64zm1.3 4.29l3.52 11.85H9.68l2.67-4.75h-2.9l3.9-7.1z" />
    </svg>
  );
}

export function KimiLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M4 3h3.5v7.2L14.8 3H19l-8.2 8.6L20 21h-4.3l-5.6-6.6-2.6 2.7V21H4V3z" />
    </svg>
  );
}

export function CustomEndpointLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

export function DeepSeekLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c1.5 1.26 3.5 2 5.5 2 4.5 0 8.5-3.5 10-8.5-1.5 2-4 3.5-7 3.5-2 0-3.5-.5-5-2-1.5-1.5-2-3-2-5 0-1.5.5-3 1.5-4C5 4 3 6.5 3 9.5c0 2.5 1 5 1.5 7z" />
      <circle cx="8" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

export function XAILogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PerplexityLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function CohereLogo({ className = "w-4 h-4", size = 16 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z" />
    </svg>
  );
}

export interface ModelProviderLogoProps {
  provider?: string;
  modelId?: string;
  modelName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Deep Obsidian themed Model Provider Logo Badge.
 * Strictly adheres to OsterdOps design guidelines:
 * - Obsidian background (#141414), subtle border (#262626)
 * - Warm metallic amber/gold (text-amber-400, border-amber-400/40) for highlights
 * - Zero blur filters, zero purple/neon gradients
 */
export function ModelProviderLogo({
  provider = "",
  modelId = "",
  modelName = "",
  size = "md",
  className = "",
}: ModelProviderLogoProps) {
  const p = (provider || "").toLowerCase();
  const m = (modelId || modelName || "").toLowerCase();

  const sizeClasses =
    size === "sm"
      ? "w-6 h-6 p-1 rounded-md text-xs"
      : size === "lg"
      ? "w-11 h-11 p-2.5 rounded-xl text-base"
      : "w-8 h-8 p-1.5 rounded-lg text-sm";

  const iconSizes = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  // Unified Deep Obsidian container with metallic champagne / gold accent
  const baseContainer = `${sizeClasses} bg-[#0A0A0A] border border-[#161616] text-[#D4A362] flex items-center justify-center shrink-0 group-hover:border-[#D4A362]/40 transition-colors ${className}`;

  // 1. Google Gemini
  if (p === "gemini" || p === "google" || m.startsWith("gemini")) {
    return (
      <div className={baseContainer} title="Google Gemini">
        <GoogleGeminiLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 2. Anthropic Claude
  if (p === "anthropic" || m.startsWith("claude")) {
    return (
      <div className={baseContainer} title="Anthropic Claude">
        <AnthropicLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 3. Meta LLaMA
  if (p === "meta" || m.startsWith("llama")) {
    return (
      <div className={baseContainer} title="Meta LLaMA">
        <MetaLlamaLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 4. Groq Cloud
  if (p === "groq") {
    return (
      <div className={baseContainer} title="Groq Fast LPU">
        <GroqLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 5. Mistral AI
  if (p === "mistral" || m.startsWith("mistral") || m.startsWith("codestral") || m.startsWith("pixtral")) {
    return (
      <div className={baseContainer} title="Mistral AI">
        <MistralLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 6. Moonshot AI (Kimi)
  if (p === "kimi" || p === "moonshot" || m.startsWith("kimi") || m.startsWith("moonshot")) {
    return (
      <div className={baseContainer} title="Moonshot AI (Kimi)">
        <KimiLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 7. DeepSeek AI
  if (p === "deepseek" || m.startsWith("deepseek")) {
    return (
      <div className={baseContainer} title="DeepSeek AI">
        <DeepSeekLogo size={iconSizes} className="w-full h-full text-[#DFB277]" />
      </div>
    );
  }

  // 8. xAI Grok
  if (p === "xai" || m.startsWith("grok")) {
    return (
      <div className={baseContainer} title="xAI (Grok)">
        <XAILogo size={iconSizes} className="w-full h-full text-[#DFB277]" />
      </div>
    );
  }

  // 9. Perplexity AI
  if (p === "perplexity" || m.startsWith("sonar")) {
    return (
      <div className={baseContainer} title="Perplexity AI">
        <PerplexityLogo size={iconSizes} className="w-full h-full text-[#DFB277]" />
      </div>
    );
  }

  // 10. Cohere
  if (p === "cohere" || m.startsWith("command") || m.startsWith("embed-english")) {
    return (
      <div className={baseContainer} title="Cohere">
        <CohereLogo size={iconSizes} className="w-full h-full text-[#DFB277]" />
      </div>
    );
  }

  // 7. AWS Bedrock
  if (p === "bedrock" || p === "aws" || m.startsWith("bedrock/")) {
    return (
      <div className={baseContainer} title="AWS Bedrock">
        <AWSBedrockLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 8. Azure OpenAI
  if (p === "azure" || m.startsWith("azure/")) {
    return (
      <div className={baseContainer} title="Azure OpenAI">
        <AzureLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // 9. Custom / LocalAI / Ollama / vLLM
  if (p === "custom") {
    return (
      <div className={baseContainer} title="Custom OpenAI-Compatible Endpoint">
        <CustomEndpointLogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
      </div>
    );
  }

  // Default: OpenAI
  return (
    <div className={baseContainer} title="OpenAI">
      <OpenAILogo size={iconSizes} className="w-full h-full text-[#D4A362]" />
    </div>
  );
}

export const ModelIconBadge = ModelProviderLogo;
export const ProviderIconBadge = ModelProviderLogo;
