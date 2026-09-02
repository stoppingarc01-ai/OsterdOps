"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, currentOrg } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    orgName: "",
    industry: "Technology",
    companySize: "11 – 50 employees",
    country: "United States",
    connectedProviders: [],
    optimizationLevel: "Balanced",
    notificationPreference: "Email",
    defaultCurrency: "USD",
    teamMembers: [],
  });
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (user || currentOrg) {
      setData((prev) => ({
        ...prev,
        orgName: prev.orgName || currentOrg?.name || (user?.displayName ? `${user.displayName}'s Organization` : ""),
        teamMembers:
          prev.teamMembers.length === 0 && user
            ? [
                {
                  id: user.uid,
                  name: user.displayName || user.email?.split("@")[0] || "Workspace Owner",
                  email: user.email || "",
                  role: "Owner",
                  isYou: true,
                },
              ]
            : prev.teamMembers,
      }));
    }
  }, [user, currentOrg]);

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
      <div className="w-full max-w-5xl bg-[#0c0e17] border border-[#1b1e2c] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Left Side: Progress Sidebar */}
        <OnboardingSidebar
          currentStep={currentStep}
          onSelectStep={(step: number) => {
            if (step < currentStep) setCurrentStep(step);
          }}
          onOpenSupport={() => setIsSupportOpen(true)}
        />

        {/* Right Side: Step Canvas */}
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepWelcome key="step1" onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <StepOrganization
                key="step2"
                data={data}
                onChange={updateFields}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <StepConnectData
                key="step3"
                data={data}
                onChange={updateFields}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <StepPreferences
                key="step4"
                data={data}
                onChange={updateFields}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <StepTeamMembers
                key="step5"
                data={data}
                onChange={updateFields}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 6 && (
              <StepReviewFinish
                key="step6"
                data={data}
                onFinish={handleFinish}
                onReviewSettings={() => setCurrentStep(2)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contact Support Dialog Modal */}
      <ContactSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
