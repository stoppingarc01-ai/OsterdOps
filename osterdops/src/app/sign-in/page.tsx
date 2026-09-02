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
  Lock,
} from "lucide-react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { OtpInput } from "@/components/auth/OtpInput";

type SignInMode = "phone" | "credentials";

export default function SignInPage() {
  const router = useRouter();

  // Mode Selection: Phone OTP vs Enterprise Credentials
  const [activeTab, setActiveTab] = useState<SignInMode>("phone");

  // Phone OTP Flow State
  const [phoneStep, setPhoneStep] = useState<"enter-phone" | "enter-otp">("enter-phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Credentials Flow State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Async & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Clean error translation helper
  const mapAuthError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("auth/invalid-phone-number")) {
      return "Invalid phone number format. Please include country code (e.g. +1 555 0100).";
    }
    if (message.includes("auth/quota-exceeded") || message.includes("auth/too-many-requests")) {
      return "Security rate limit exceeded. Please wait 60 seconds or sign in with credentials.";
    }
    if (message.includes("auth/code-expired")) {
      return "Verification code has expired. Request a new code to continue.";
    }
    if (message.includes("auth/invalid-verification-code")) {
      return "Incorrect 6-digit verification code. Please check and retry.";
    }
    if (
      message.includes("auth/invalid-credential") ||
      message.includes("auth/wrong-password") ||
      message.includes("auth/user-not-found")
    ) {
      return "Invalid enterprise credentials provided.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network error. Please verify your connection to the gateway.";
    }
    return message.replace(/^Firebase:\s*/i, "").replace(/\(auth\/[^)]+\)\.?/i, "").trim() || "Authentication failed.";
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
          // ignore cleanup errors on unmount
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

  // Step 1: Send Phone OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const formatted = phoneNumber.trim();
    if (!formatted) {
      setError("Please enter an administrative phone number.");
      return;
    }

    if (!formatted.startsWith("+")) {
      setError("Please include international country dialing code (e.g. +1 555-0199).");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formatted, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep("enter-otp");
      setCountdown(60);
      setInfoMessage(`Authentication token dispatched to ${formatted}`);
    } catch (err) {
      console.error("[OsterdOps Auth] Phone OTP send failed:", err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm OTP Code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }
    if (!confirmationResult) {
      setError("Active verification session expired. Please request a new token.");
      setPhoneStep("enter-phone");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const credential = await confirmationResult.confirm(code);
      // Force token refresh to establish session
      await credential.user.getIdToken(true);
      router.push("/dashboard");
    } catch (err) {
      console.error("[OsterdOps Auth] OTP verification failed:", err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    await handleSendOtp();
  };

  // Fallback: Enterprise Credentials Sign-In
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both work email and account password.");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await credential.user.getIdToken(true);
      router.push("/dashboard");
    } catch (err) {
      console.error("[OsterdOps Auth] Credentials sign-in failed:", err);
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

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-neutral-400 tracking-wide uppercase">
              GATEWAY_ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper with strict Deep Obsidian aesthetics */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 shadow-2xl">
            {/* Header / Security Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[#262626] bg-[#0A0A0A] mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  Zero-Trust Auth // v2.4
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Enterprise Access
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Authenticate tenant session to access LLM gateway controls.
              </p>
            </div>

            {/* Error & Info Banners */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {infoMessage && !error && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-start gap-2.5 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{infoMessage}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0A0A0A] border border-[#262626] rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("phone");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-medium transition-all ${
                  activeTab === "phone"
                    ? "bg-[#1C1C1C] text-white border border-[#333333] shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("credentials");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-medium transition-all ${
                  activeTab === "credentials"
                    ? "bg-[#1C1C1C] text-white border border-[#333333] shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Credentials</span>
              </button>
            </div>

            {/* Tab 1: Phone OTP Authentication */}
            {activeTab === "phone" && (
              <div>
                {phoneStep === "enter-phone" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone-input"
                        className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2"
                      >
                        Admin Phone Number
                      </label>
                      <div className="relative">
                        <input
                          id="phone-input"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 555 019 2834"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                        />
                        <div className="absolute right-3 top-2.5 text-neutral-500">
                          <Smartphone className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-mono text-[10px] text-neutral-500 mt-1.5">
                        Format: International E.164 (+[country code][number])
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !phoneNumber.trim()}
                      className="w-full bg-neutral-100 hover:bg-white text-black font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Attestation Challenge
                      </div>
                      <div className="text-xs text-neutral-300">
                        Enter the 6 digits sent to{" "}
                        <span className="font-mono font-semibold text-white">{phoneNumber}</span>
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
                        onComplete={(code) => handleVerifyOtp(code)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full bg-neutral-100 hover:bg-white text-black font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Validating Attestation...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm & Sign In</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep("enter-phone");
                          setOtpCode("");
                          setError(null);
                        }}
                        disabled={isLoading}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors font-mono text-[11px]"
                      >
                        ← Edit Phone
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
              </div>
            )}

            {/* Tab 2: Enterprise Credentials Fallback */}
            {activeTab === "credentials" && (
              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                <div>
                  <label
                    htmlFor="email-input"
                    className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2"
                  >
                    Enterprise Email
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@enterprise.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password-input"
                      className="font-mono text-[11px] uppercase tracking-wider text-neutral-400"
                    >
                      Password
                    </label>
                    <span className="font-mono text-[10px] text-neutral-500">SSO // ENCRYPTED</span>
                  </div>
                  <div className="relative">
                    <input
                      id="password-input"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-2.5 text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#0A0A0A] border-[#262626] text-amber-400 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-neutral-400 text-xs">Remember device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full bg-neutral-100 hover:bg-white text-black font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Provisioning CTA */}
            <div className="mt-6 pt-5 border-t border-[#262626] text-center">
              <p className="text-xs text-neutral-400">
                Need a new tenant workspace?{" "}
                <Link
                  href="/sign-up"
                  className="text-white hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
                >
                  Provision Enterprise Account
                </Link>
              </p>
            </div>
          </div>

          {/* Infrastructure Metadata Card */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-neutral-400" />
              <span>TENANT_ISOLATION: STRICT</span>
            </div>
            <span>SOC2 // HIPAA READY</span>
          </div>
        </div>
      </main>

      {/* Enterprise Minimal Footer */}
      <footer className="w-full border-t border-[#262626] bg-[#0A0A0A] px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
          <div>&copy; {new Date().getFullYear()} OsterdOps Enterprise AI Gateway. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">Security Spec</span>
            <span className="hover:text-neutral-400 cursor-pointer">Compliance Matrix</span>
            <span className="hover:text-neutral-400 cursor-pointer">Gateway SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
