"use client";

import React from "react";

interface LogoProps {
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
      fill="none"
      className={className}
    >
      <path
        d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
        fill="currentColor"
      />
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
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 12c-2-3-4.5-5-7.5-5A4.5 4.5 0 0 0 0 11.5 4.5 4.5 0 0 0 4.5 16c3 0 5.5-2 7.5-5zm0 0c2 3 4.5 5 7.5 5a4.5 4.5 0 0 0 4.5-4.5A4.5 4.5 0 0 0 19.5 7c-3 0-5.5 2-7.5 5z" />
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
      <rect x="2" y="3" width="4" height="4" rx="1" />
      <rect x="18" y="3" width="4" height="4" rx="1" />
      <rect x="6" y="7" width="4" height="4" rx="1" />
      <rect x="14" y="7" width="4" height="4" rx="1" />
      <rect x="10" y="11" width="4" height="4" rx="1" />
      <rect x="6" y="15" width="4" height="4" rx="1" />
      <rect x="14" y="15" width="4" height="4" rx="1" />
      <rect x="2" y="19" width="4" height="4" rx="1" />
      <rect x="18" y="19" width="4" height="4" rx="1" />
    </svg>
  );
}

interface ModelIconBadgeProps {
  modelName: string;
  provider?: string;
  size?: "sm" | "md" | "lg";
}

export function ModelIconBadge({ modelName, provider, size = "md" }: ModelIconBadgeProps) {
  const name = modelName.toLowerCase();
  const prov = (provider || "").toLowerCase();

  const dimensions =
    size === "sm"
      ? "w-6 h-6 rounded-lg p-1"
      : size === "lg"
      ? "w-10 h-10 rounded-xl p-2"
      : "w-7 h-7 rounded-xl p-1.5";

  if (name.includes("claude") || prov.includes("anthropic")) {
    return (
      <div
        className={`${dimensions} bg-gradient-to-br from-[#d97706]/20 to-[#92400e]/30 border border-[#d97706]/40 text-[#f59e0b] shadow-[0_0_10px_rgba(217,119,6,0.15)] flex items-center justify-center shrink-0`}
        title="Anthropic Claude"
      >
        <AnthropicLogo className="w-full h-full" />
      </div>
    );
  }

  if (name.includes("gemini") || prov.includes("google") || name.includes("vertex")) {
    return (
      <div
        className={`${dimensions} bg-gradient-to-br from-[#3b82f6]/20 via-[#8b5cf6]/20 to-[#ec4899]/20 border border-[#3b82f6]/40 text-[#60a5fa] shadow-[0_0_10px_rgba(59,130,246,0.15)] flex items-center justify-center shrink-0`}
        title="Google Gemini"
      >
        <GoogleGeminiLogo className="w-full h-full text-[#60a5fa]" />
      </div>
    );
  }

  if (name.includes("llama") || prov.includes("meta") || prov.includes("bedrock") || prov.includes("aws")) {
    return (
      <div
        className={`${dimensions} bg-gradient-to-br from-[#f59e0b]/20 to-[#d97706]/30 border border-[#f59e0b]/40 text-[#fbbf24] shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center justify-center shrink-0`}
        title="AWS Bedrock / Meta"
      >
        <AWSBedrockLogo className="w-full h-full" />
      </div>
    );
  }

  if (name.includes("mistral") || name.includes("codestral")) {
    return (
      <div
        className={`${dimensions} bg-gradient-to-br from-[#ea580c]/20 to-[#c2410c]/30 border border-[#ea580c]/40 text-[#fb923c] shadow-[0_0_10px_rgba(234,88,12,0.15)] flex items-center justify-center shrink-0`}
        title="Mistral AI"
      >
        <MistralLogo className="w-full h-full" />
      </div>
    );
  }

  // Default OpenAI (gpt-4o, gpt-4o-mini, embeddings, dall-e, whisper, etc.)
  return (
    <div
      className={`${dimensions} bg-gradient-to-br from-[#dfba82]/20 to-[#b8860b]/30 border border-[#dfba82]/40 text-[#dfba82] shadow-[0_0_10px_rgba(223,186,130,0.18)] flex items-center justify-center shrink-0`}
      title="OpenAI"
    >
      <OpenAILogo className="w-full h-full" />
    </div>
  );
}

export function ProviderIconBadge({ provider }: { provider: string }) {
  const p = provider.toLowerCase();

  if (p.includes("anthropic")) {
    return (
      <div className="flex items-center gap-1.5 text-white font-medium">
        <div className="w-4 h-4 rounded-md bg-[#d97706]/20 text-[#f59e0b] p-0.5 flex items-center justify-center">
          <AnthropicLogo className="w-full h-full" />
        </div>
        <span>Anthropic</span>
      </div>
    );
  }

  if (p.includes("google")) {
    return (
      <div className="flex items-center gap-1.5 text-white font-medium">
        <div className="w-4 h-4 rounded-md bg-[#3b82f6]/20 text-[#60a5fa] p-0.5 flex items-center justify-center">
          <GoogleGeminiLogo className="w-full h-full" />
        </div>
        <span>Google</span>
      </div>
    );
  }

  if (p.includes("aws") || p.includes("bedrock")) {
    return (
      <div className="flex items-center gap-1.5 text-white font-medium">
        <div className="w-4 h-4 rounded-md bg-[#f59e0b]/20 text-[#fbbf24] p-0.5 flex items-center justify-center">
          <AWSBedrockLogo className="w-full h-full" />
        </div>
        <span>AWS Bedrock</span>
      </div>
    );
  }

  // Default OpenAI
  return (
    <div className="flex items-center gap-1.5 text-white font-medium">
      <div className="w-4 h-4 rounded-md bg-[#dfba82]/20 text-[#dfba82] p-0.5 flex items-center justify-center">
        <OpenAILogo className="w-full h-full" />
      </div>
      <span>OpenAI</span>
    </div>
  );
}
