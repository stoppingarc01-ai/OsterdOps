import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { IntegrationsSection } from "@/components/marketing/IntegrationsSection";
import { StatsBar } from "@/components/marketing/StatsBar";
import { CodeIntegrationSection } from "@/components/marketing/CodeIntegrationSection";
import { EnterpriseSecuritySection } from "@/components/marketing/EnterpriseSecuritySection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090e] text-white">
      {/* Sticky Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Split Hero (Light Left with 6-Feature Grid + Obsidian Right with 3D Dashboard) */}
        <HeroSection />

        {/* AI Model Ecosystem Integrations */}
        <IntegrationsSection />

        {/* Enterprise Metrics Bar */}
        <StatsBar />

        {/* 60-Second Proxy SDK Code Integration */}
        <CodeIntegrationSection />

        {/* Enterprise Security & Compliance Grid */}
        <EnterpriseSecuritySection />

        {/* Pre-Footer Conversion CTA Banner */}
        <CtaSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
