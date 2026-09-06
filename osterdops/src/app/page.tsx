import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Supporting Homepage Components adhering to strict Deep Obsidian + Champagne Gold tokens
import { HomeHero } from "@/components/home/HomeHero";
import { FeatureTrustBar } from "@/components/home/FeatureTrustBar";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import { ProxySwitcher } from "@/components/home/ProxySwitcher";
import { FinOpsSimulator } from "@/components/home/FinOpsSimulator";
import { InteractiveRoiCalculator } from "@/components/home/InteractiveRoiCalculator";
import { HeliconeComparison } from "@/components/home/HeliconeComparison";
import { PiiSanitizerDemo } from "@/components/home/PiiSanitizerDemo";
import { FloatingModelsSection } from "@/components/home/FloatingModelsSection";
import { AmbientFloatingLogos } from "@/components/home/AmbientFloatingLogos";
import { GlobalEdgeSection } from "@/components/home/GlobalEdgeSection";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { CustomerProofSection } from "@/components/home/CustomerProofSection";
import { HomePricing } from "@/components/home/HomePricing";
import { SecurityFaqSection } from "@/components/home/SecurityFaqSection";
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

        {/* 2.5 Interactive Architecture Comparison: Before vs. After Slider */}
        <BeforeAfterSlider />

        {/* 3. 1-Minute Drop-in Proxy (3-step vertical stepper + tabs) */}
        <ProxySwitcher />

        {/* 4. Interactive FinOps & Failover Simulator (OpenAI 429 failover & runaway loop breaker) */}
        <FinOpsSimulator />

        {/* 5. Interactive FinOps ROI Calculator (Live margin reclamation calculator) */}
        <InteractiveRoiCalculator />

        {/* 6. Active Pre-Flight Firewall vs. Passive Logging (Direct Helicone Comparison) */}
        <HeliconeComparison />

        {/* 7. Zero-Data Retention (ZDR) & Security Sanitizer */}
        <PiiSanitizerDemo />

        {/* 8. 64+ Frontier & Open Models Mesh */}
        <FloatingModelsSection />

        {/* 9. Global Anycast Edge Network & Live Telemetry Map */}
        <GlobalEdgeSection />

        {/* 10. Deployment Topologies (Cloud vs. VPC) */}
        <ArchitectureSection />

        {/* 11. Production Scale Metrics, Engineering Testimonials & Ecosystem Compatibility */}
        <CustomerProofSection />

        {/* 12. Transparent Pricing Grid (Developer $0, Growth $49, Scale $159, Enterprise Custom) */}
        <HomePricing />

        {/* 13. Enterprise Security & Technical FAQ Accordion */}
        <SecurityFaqSection />

        {/* 14. Final CTA Banner ("Deploy Your AI Perimeter in 60 Seconds") */}
        <HomeFinalCta />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
