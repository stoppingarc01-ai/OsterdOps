"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { ContactSupportModal } from "@/components/onboarding/ContactSupportModal";
import { StepWelcome } from "@/components/onboarding/steps/StepWelcome";
import { StepOrganization } from "@/components/onboarding/steps/StepOrganization";
import { StepConnectData } from "@/components/onboarding/steps/StepConnectData";
import { StepPreferences } from "@/components/onboarding/steps/StepPreferences";
import { StepTeamMembers } from "@/components/onboarding/steps/StepTeamMembers";
import { StepReviewFinish } from "@/components/onboarding/steps/StepReviewFinish";
import { OnboardingData } from "@/components/onboarding/types";
import { useRouter } from "next/navigation";

const INITIAL_DATA: OnboardingData = {
  orgName: "Acme Corporation",
  industry: "Technology",
  companySize: "51 – 200 employees",
  country: "United States",
  connectedProviders: ["openai"],
  optimizationLevel: "Balanced",
  notificationPreference: "Email",
  defaultCurrency: "USD",
  teamMembers: [
    {
      id: "1",
      name: "Shaan Prasad",
      email: "shaan@acmecorp.com",
      role: "Owner",
      isYou: true,
    },
    {
      id: "2",
      name: "Ava Rodriguez",
      email: "ava@acmecorp.com",
      role: "Admin",
    },
    {
      id: "3",
      name: "James Miller",
      email: "james@acmecorp.com",
      role: "Editor",
    },
    {
      id: "4",
      name: "Daniel Smith",
      email: "daniel@acmecorp.com",
      role: "Viewer",
    },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const updateFields = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to main application dashboard page
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex items-center justify-center p-4 sm:p-6 md:p-8 relative selection:bg-[#dfba82] selection:text-black overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#dfba82]/[0.03] blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-[#1e293b]/[0.15] blur-[150px]" />
        <div className="absolute -bottom-32 left-1/4 w-[650px] h-[650px] rounded-full bg-[#dfba82]/[0.02] blur-[160px]" />
      </div>

      {/* Main Container Wrapper Card */}
      <div className="w-full max-w-6xl bg-[#090a0f]/90 border border-[#1a1c28] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_0_1px_rgba(223,186,130,0.1)] backdrop-blur-xl overflow-hidden relative z-10 flex flex-col lg:flex-row">
        {/* Left Stepper Sidebar */}
        <OnboardingSidebar
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          onOpenSupport={() => setIsSupportOpen(true)}
        />

        {/* Right Main Content Panel */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[85vh] lg:max-h-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full h-full"
            >
              {currentStep === 1 && <StepWelcome onNext={handleNext} />}
              {currentStep === 2 && (
                <StepOrganization
                  data={data}
                  onChange={updateFields}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <StepConnectData
                  data={data}
                  onChange={updateFields}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 4 && (
                <StepPreferences
                  data={data}
                  onChange={updateFields}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 5 && (
                <StepTeamMembers
                  data={data}
                  onChange={updateFields}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 6 && (
                <StepReviewFinish
                  data={data}
                  onFinish={handleFinish}
                  onReviewSettings={() => setCurrentStep(2)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Support Modal */}
      <ContactSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
