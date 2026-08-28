"use client";

import React from "react";

interface IntegrationLogoProps {
  id: string;
  className?: string;
  size?: number;
}

export function IntegrationLogoBadge({ id, size = 32 }: { id: string; size?: number }) {
  const key = id.toLowerCase();

  // 1. OpenAI
  if (key.includes("openai") && !key.includes("azure")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dfba82]/20 to-[#b8860b]/30 border border-[#dfba82]/40 text-[#dfba82] shadow-[0_0_12px_rgba(223,186,130,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      </div>
    );
  }

  // 2. Anthropic Claude
  if (key.includes("anthropic") || key.includes("claude")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97706]/20 to-[#92400e]/30 border border-[#d97706]/40 text-[#f59e0b] shadow-[0_0_12px_rgba(217,119,6,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.827 3.5h3.693l6.48 17h-3.693l-1.637-4.307h-7.38l-1.637 4.307H5.96L12.44 3.5h1.387zm4.307 9.886l-2.653-6.98-2.653 6.98h5.306zM3.48 20.5L0 3.5h3.693l2.36 12.027L7.4 3.5h3.693l-3.48 17H3.48z" />
        </svg>
      </div>
    );
  }

  // 3. Google Vertex / Gemini
  if (key.includes("google") || key.includes("vertex") || key.includes("gemini")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 via-[#8b5cf6]/20 to-[#ec4899]/20 border border-[#3b82f6]/40 text-[#60a5fa] shadow-[0_0_12px_rgba(59,130,246,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 4. AWS Bedrock
  if (key.includes("aws") || key.includes("bedrock")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#b45309]/30 border border-[#f59e0b]/40 text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
    );
  }

  // 5. Datadog APM
  if (key.includes("datadog")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#4338ca]/30 border border-[#6366f1]/40 text-[#818cf8] shadow-[0_0_12px_rgba(99,102,241,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V17c0-.55-.45-1-1-1s-1 .45-1 1v-.07C7.45 16.48 5 13.53 5 10c0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.53-2.45 6.48-6 6.93zM10 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
        </svg>
      </div>
    );
  }

  // 6. Langfuse
  if (key.includes("langfuse")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#0891b2]/30 border border-[#06b6d4]/40 text-[#22d3ee] shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
    );
  }

  // 7. Slack Webhooks
  if (key.includes("slack")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ec4899]/20 to-[#be185d]/30 border border-[#ec4899]/40 text-[#f472b6] shadow-[0_0_12px_rgba(236,72,153,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      </div>
    );
  }

  // 8. Azure OpenAI
  if (key.includes("azure")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7]/20 to-[#0369a1]/30 border border-[#0284c7]/40 text-[#38bdf8] shadow-[0_0_12px_rgba(2,132,199,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.05 4.24l-4.5 7.8 7.35 6.42 4.05-7.05-6.9-7.17zm-4.95 8.76l-4.05 7.02 9.45-.02-5.4-7z" />
        </svg>
      </div>
    );
  }

  // 9. OpenTelemetry (OTel)
  if (key.includes("opentelemetry") || key.includes("otel")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#64748b]/20 to-[#334155]/30 border border-[#64748b]/40 text-[#94a3b8] shadow-[0_0_12px_rgba(100,116,139,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>
    );
  }

  // 10. PagerDuty
  if (key.includes("pagerduty")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#047857]/30 border border-[#10b981]/40 text-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 2H5v20h4.5v-7H15.5c4.7 0 8.5-3.8 8.5-8.5S20.2 2 15.5 2zm0 11.5H9.5V7.5h6c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5z" />
        </svg>
      </div>
    );
  }

  // 11. GCP Cloud Billing
  if (key.includes("gcp") || key.includes("cloud-billing")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ea4335]/20 via-[#4285f4]/20 to-[#34a853]/20 border border-[#4285f4]/40 text-[#60a5fa] shadow-[0_0_12px_rgba(66,133,244,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
        </svg>
      </div>
    );
  }

  // 12. Mistral AI & Ollama
  if (key.includes("mistral") || key.includes("ollama")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ea580c]/20 to-[#c2410c]/30 border border-[#ea580c]/40 text-[#fb923c] shadow-[0_0_12px_rgba(234,88,12,0.2)] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] text-[#dfba82] font-bold text-xs flex items-center justify-center shrink-0">
      ✦
    </div>
  );
}
