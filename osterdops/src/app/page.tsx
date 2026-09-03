import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Supporting Homepage Components adhering to strict Deep Obsidian + Champagne Gold tokens
import { HomeHero } from "@/components/home/HomeHero";
import { FeatureTrustBar } from "@/components/home/FeatureTrustBar";
import { ProxySwitcher } from "@/components/home/ProxySwitcher";
import { FinOpsSimulator } from "@/components/home/FinOpsSimulator";
import { HeliconeComparison } from "@/components/home/HeliconeComparison";
import { PiiSanitizerDemo } from "@/components/home/PiiSanitizerDemo";
import { FloatingModelsSection } from "@/components/home/FloatingModelsSection";
import { AmbientFloatingLogos } from "@/components/home/AmbientFloatingLogos";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { HomePricing } from "@/components/home/HomePricing";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#DFB277] selection:text-[#080808] font-sans relative overflow-x-clip">
      {/* Site-wide Ambient Floating Model Logos along the outer edges */}
      <AmbientFloatingLogos />

      {/* Sticky Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section (Value proposition + Perspective Dashboard Preview) */}
        <HomeHero />

        {/* 2. Live Metrics / SLA Strip (6-pillar trust grid) */}
        <FeatureTrustBar />

        {/* 3. 1-Minute Drop-in Proxy (3-step vertical stepper + tabs) */}
        <ProxySwitcher />

        {/* 4. Interactive FinOps & Failover Simulator (OpenAI 429 failover & runaway loop breaker) */}
        <FinOpsSimulator />

        {/* 5. Active Pre-Flight Firewall vs. Passive Logging (Direct Helicone Comparison) */}
        <HeliconeComparison />

        {/* 6. Zero-Data Retention (ZDR) & Security Sanitizer */}
        <PiiSanitizerDemo />

        {/* 7. 64+ Frontier & Open Models Mesh */}
        <FloatingModelsSection />

        {/* 8. Deployment Topologies (Cloud vs. VPC) */}
        <ArchitectureSection />

        {/* 9. Transparent Pricing Grid (Developer $0, Growth $49, Scale $159, Enterprise Custom) */}
        <HomePricing />

        {/* 10. Final CTA Banner ("Deploy Your AI Perimeter in 60 Seconds") */}
        <HomeFinalCta />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
