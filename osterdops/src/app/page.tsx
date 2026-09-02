import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// 10 Distinct Redesigned Sections
import { HomeHero } from "@/components/home/HomeHero";
import { LiveSlaStrip } from "@/components/home/LiveSlaStrip";
import { ProxySwitcher } from "@/components/home/ProxySwitcher";
import { FinOpsSimulator } from "@/components/home/FinOpsSimulator";
import { HeliconeComparison } from "@/components/home/HeliconeComparison";
import { PiiSanitizerDemo } from "@/components/home/PiiSanitizerDemo";
import { ModelsMarquee } from "@/components/home/ModelsMarquee";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { HomePricing } from "@/components/home/HomePricing";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#0E0E0E] font-sans">
      {/* Sticky Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Header (Headline + High-contrast Dashboard Preview + Dual CTAs) */}
        <HomeHero />

        {/* 2. Live Metrics SLA Strip (<8.4ms Latency | 50+ Models | 99.99% Edge SLA | 0.00% Prompt Egress) */}
        <LiveSlaStrip />

        {/* 3. 1-Minute Drop-in Proxy Switcher (Python / Node.js / cURL / LangChain tabs) */}
        <ProxySwitcher />

        {/* 4. Interactive FinOps & Failover Simulator (Auto-downgrade & 30s loop breaker in action) */}
        <FinOpsSimulator />

        {/* 5. Pre-Flight Firewall vs. Passive Logging (Direct Helicone Comparison) */}
        <HeliconeComparison />

        {/* 6. Zero-Egress PII & Security Sanitizer Demo (Interactive redaction) */}
        <PiiSanitizerDemo />

        {/* 7. Supported 50+ Frontier & Open Models Marquee (OpenAI, Gemini, Anthropic, Kimi, LLaMA) */}
        <ModelsMarquee />

        {/* 8. Deployment Architecture (Cloud Anycast Edge vs. VPC Self-Hosted Data Plane) */}
        <ArchitectureSection />

        {/* 9. Transparent Pricing Matrix (Developer $0, Team $49, Enterprise Custom) */}
        <HomePricing />

        {/* 10. Final Call To Action ("Deploy Your AI Perimeter in 60 Seconds") */}
        <HomeFinalCta />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
