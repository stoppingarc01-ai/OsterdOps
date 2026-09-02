"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  ArrowRight,
  Building,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { OtpInput } from "@/components/auth/OtpInput";

export default function SignUpPage() {
  const router = useRouter();

  // Two-step onboarding flow state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Enterprise Profile & Phone
  const [organizationName, setOrganizationName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: Verification
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);

  // UI & Processing States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Clean error translation helper
  const mapAuthError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("auth/invalid-phone-number")) {
      return "Invalid phone number format. Please provide full international format with '+' (e.g. +1 555 0100).";
    }
    if (message.includes("auth/quota-exceeded") || message.includes("auth/too-many-requests")) {
      return "Security verification quota exceeded. Please wait 60 seconds before trying again.";
    }
    if (message.includes("auth/code-expired")) {
      return "Verification code has expired. Please click 'Resend Code' to request a new token.";
    }
    if (message.includes("auth/invalid-verification-code")) {
      return "The 6-digit verification code entered is incorrect. Please check and retry.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network connection failure. Please verify connectivity to the gateway.";
    }
    return message.replace(/^Firebase:\s*/i, "").replace(/\(auth\/[^)]+\)\.?/i, "").trim() || "Registration failed.";
  };

  // 60-second cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Clean up RecaptchaVerifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore cleanup exceptions on unmount
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Initialize or reset invisible reCAPTCHA verifier
  const getOrCreateRecaptcha = useCallback((): RecaptchaVerifier => {
    const auth = getFirebaseAuth();
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // safely discard stale widget
      }
      recaptchaVerifierRef.current = null;
    }

    const container = document.getElementById("recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA verification passed
      },
      "expired-callback": () => {
        setError("Security attestation expired. Please resend the verification code.");
      },
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  // Step 1 Submission: Initiate Phone Verification
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanOrg = organizationName.trim();
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanOrg) {
      setError("Please provide an Organization Name for tenant isolation.");
      return;
    }
    if (cleanOrg.length < 2) {
      setError("Organization Name must be at least 2 characters.");
      return;
    }
    if (!cleanName) {
      setError("Please enter the administrator's Full Name.");
      return;
    }
    if (!cleanPhone) {
      setError("Please enter the administrator's Phone Number.");
      return;
    }
    if (!cleanPhone.startsWith("+")) {
      setError("Phone number must include international country code (e.g. +1 555-0199).");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
      setConfirmationResult(confirmation);
      setCurrentStep(2);
      setCountdown(60);
      setStatusMessage(`Verification challenge sent to ${cleanPhone}`);
    } catch (err) {
      console.error("[OsterdOps SignUp] Phone verification dispatch failed:", err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Submission: Confirm OTP & Provision Workspace
  const handleVerifyAndProvision = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (!confirmationResult) {
      setError("Active verification session expired. Please start over.");
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage("Verifying attestation and provisioning tenant...");

    try {
      // 1. Confirm OTP through Firebase Auth
      const credential = await confirmationResult.confirm(code);
      const user = credential.user;

      // 2. Set user display name
      try {
        await updateProfile(user, { displayName: fullName.trim() });
      } catch {
        // Non-fatal, proceed with registration contract
      }

      // 3. Acquire fresh ID token
      const idToken = await user.getIdToken(true);

      // 4. Bind authenticated UID to existing tenant provisioning contract
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          name: fullName.trim(),
          organizationName: organizationName.trim(),
          phone: phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Workspace provisioning encountered an error.");
      }

      // 5. Navigate to Dashboard upon successful provisioning
      router.push("/dashboard");
    } catch (err) {
      console.error("[OsterdOps SignUp] Verification or provisioning failed:", err);
      setError(mapAuthError(err));
      setStatusMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), appVerifier);
      setConfirmationResult(confirmation);
      setCountdown(60);
      setStatusMessage(`New verification code sent to ${phoneNumber.trim()}`);
    } catch (err) {
      console.error("[OsterdOps SignUp] Resend OTP failed:", err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col justify-between selection:bg-neutral-800 selection:text-white">
      {/* Invisible container for Firebase Phone reCAPTCHA */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} aria-hidden="true" />

      {/* Top Enterprise Navigation Bar */}
      <header className="w-full border-b border-[#262626] bg-[#0A0A0A] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded border border-[#262626] bg-[#111111] flex items-center justify-center text-amber-300 font-mono font-bold text-sm group-hover:border-neutral-700 transition-colors">
              Ø
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white tracking-tight text-sm">OsterdOps</span>
              <span className="font-mono text-[10px] text-neutral-500 tracking-wider uppercase">Enterprise Gateway</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-neutral-400 tracking-wide uppercase">
                PROVISIONING_ACTIVE
              </span>
            </div>
            <Link
              href="/sign-in"
              className="font-mono text-[11px] text-neutral-400 hover:text-white transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper with Deep Obsidian styling */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 shadow-2xl">
            {/* Step Progress Tracker */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[#262626] bg-[#0A0A0A]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                    {currentStep === 1
                      ? "STEP 01 // TENANT SPECS"
                      : "STEP 02 // SECURITY ATTESTATION"}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-neutral-500">
                  {currentStep === 1 ? "1 of 2" : "2 of 2"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {currentStep === 1 ? "Provision Tenant Gateway" : "Confirm Security Token"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {currentStep === 1
                  ? "Initialize dedicated workspace with multi-tenant isolation and OWNER privileges."
                  : `Enter the 6-digit attestation code dispatched to ${phoneNumber}.`}
              </p>
            </div>

            {/* Error & Info Alerts */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {statusMessage && !error && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-start gap-2.5 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{statusMessage}</span>
              </div>
            )}

            {/* Step 1: Collect Organization Name, Full Name, Admin Phone */}
            {currentStep === 1 && (
              <form onSubmit={handleInitiateVerification} className="space-y-4">
                <div>
                  <label
                    htmlFor="org-name"
                    className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2"
                  >
                    Organization Name
                  </label>
                  <div className="relative">
                    <input
                      id="org-name"
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme AI Technologies"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-2.5 text-neutral-500">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-500 mt-1">
                    Provisions isolated database partition & gateway routing slug
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="full-name"
                    className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2"
                  >
                    Primary Administrator Name
                  </label>
                  <div className="relative">
                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Sarah Connor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-2.5 text-neutral-500">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-phone"
                    className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2"
                  >
                    Admin Phone Number (OTP Target)
                  </label>
                  <div className="relative">
                    <input
                      id="admin-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 555 019 9234"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-2.5 text-neutral-500">
                      <Smartphone className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-500 mt-1">
                    E.164 international standard (+1 / +44 / +91)
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !organizationName.trim() ||
                      !fullName.trim() ||
                      !phoneNumber.trim()
                    }
                    className="w-full bg-neutral-100 hover:bg-white text-black font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating Spec...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: 6-Digit OTP Verification Card */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-lg border border-[#262626] bg-[#0A0A0A] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-mono uppercase text-[10px]">Target Organization</span>
                    <span className="font-mono font-medium text-white">{organizationName}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-mono uppercase text-[10px]">Administrator</span>
                    <span className="font-mono text-neutral-200">{fullName}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-mono uppercase text-[10px]">Authorized Phone</span>
                    <span className="font-mono text-amber-300">{phoneNumber}</span>
                  </div>
                </div>

                <div className="py-2">
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    length={6}
                    disabled={isLoading}
                    autoFocus
                    hasError={Boolean(error)}
                    onComplete={(code) => handleVerifyAndProvision(code)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyAndProvision()}
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-neutral-100 hover:bg-white text-black font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning Workspace...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify & Provision Tenant</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setOtpCode("");
                      setError(null);
                      setStatusMessage(null);
                    }}
                    disabled={isLoading}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors font-mono text-[11px]"
                  >
                    ← Edit Details
                  </button>

                  {countdown > 0 ? (
                    <span className="font-mono text-[11px] text-neutral-500">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[11px] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Sign-In Redirection */}
            <div className="mt-6 pt-5 border-t border-[#262626] text-center">
              <p className="text-xs text-neutral-400">
                Already have an enterprise tenant?{" "}
                <Link
                  href="/sign-in"
                  className="text-white hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Provisioning Contract Guarantee */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>ROLE: OWNER // AUTOMATIC TENANT ISOLATION</span>
            </div>
            <span>EAL4+</span>
          </div>
        </div>
      </main>

      {/* Enterprise Minimal Footer */}
      <footer className="w-full border-t border-[#262626] bg-[#0A0A0A] px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
          <div>&copy; {new Date().getFullYear()} OsterdOps Enterprise AI Gateway. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">Security Spec</span>
            <span className="hover:text-neutral-400 cursor-pointer">Multi-Tenant SLA</span>
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Matrix</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
