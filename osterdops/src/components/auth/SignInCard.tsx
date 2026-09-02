"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
  X,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { useAuth } from "@/context/AuthContext";
import { OtpInput } from "./OtpInput";

export function SignInCard() {
  const router = useRouter();
  const { signIn, resetPassword, error: authError, clearError } = useAuth();

  // Authentication Mode Toggle
  const [authMethod, setAuthMethod] = useState<"credentials" | "phone">("credentials");

  // Email/Password Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Invisible Recaptcha Verifier Reference
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Clean error translation helper
  const mapAuthError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("auth/invalid-phone-number")) {
      return "Invalid phone number format. Please include country code (e.g. +1 555 0100).";
    }
    if (message.includes("auth/quota-exceeded") || message.includes("auth/too-many-requests")) {
      return "Rate limit exceeded. Please wait 60 seconds before retrying.";
    }
    if (message.includes("auth/code-expired")) {
      return "Verification code has expired. Please request a new code.";
    }
    if (message.includes("auth/invalid-verification-code")) {
      return "The 6-digit code entered is incorrect. Please check and retry.";
    }
    if (
      message.includes("auth/invalid-credential") ||
      message.includes("auth/wrong-password") ||
      message.includes("auth/user-not-found")
    ) {
      return "Invalid email or password credentials.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network connection failure. Please check your connection.";
    }
    return message.replace(/^Firebase:\s*/i, "").replace(/\(auth\/[^)]+\)\.?/i, "").trim() || "Authentication failed.";
  };

  // Cooldown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Clean up Recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

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

    const container = document.getElementById("signin-recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    const verifier = new RecaptchaVerifier(auth, "signin-recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        setFormError("Security verification expired. Please resend the verification code.");
      },
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  // Standard Email/Password Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setLocalLoading(true);

    try {
      await signIn(email, password, rememberMe);
      router.push("/dashboard");
    } catch (err: unknown) {
      setFormError(mapAuthError(err));
    } finally {
      setLocalLoading(false);
    }
  };

  // Phone Step 1: Send OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const formatted = phoneNumber.trim();
    if (!formatted) {
      setFormError("Please enter a phone number.");
      return;
    }
    if (!formatted.startsWith("+")) {
      setFormError("Please include your country dialing code (e.g. +1 555 0199).");
      return;
    }

    setPhoneLoading(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
      setConfirmationResult(confirmation);
      setPhoneStep("otp");
      setCountdown(60);
    } catch (err: unknown) {
      console.error("[OsterdOps SignIn] Phone OTP dispatch failed:", err);
      setFormError(mapAuthError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  // Phone Step 2: Confirm OTP
  const handleVerifyPhoneOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      setFormError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!confirmationResult) {
      setFormError("Verification session expired. Please request a new code.");
      setPhoneStep("phone");
      return;
    }

    setPhoneLoading(true);
    setFormError(null);
    try {
      const credential = await confirmationResult.confirm(code);
      await credential.user.getIdToken(true);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[OsterdOps SignIn] OTP confirmation failed:", err);
      setFormError(mapAuthError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || phoneLoading) return;
    setFormError(null);
    setPhoneLoading(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), verifier);
      setConfirmationResult(confirmation);
      setCountdown(60);
    } catch (err: unknown) {
      setFormError(mapAuthError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  // Password Reset Submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);
    try {
      await resetPassword(resetEmail || email);
      setResetSuccess(true);
    } catch (err: unknown) {
      setResetError((err as Error).message || "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div className="w-full max-w-[480px] bg-[#fbf7ee] text-[#1a1c24] rounded-[26px] p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(231,225,210,0.8)] transition-all relative">
      {/* Invisible container for Firebase Phone reCAPTCHA */}
      <div id="signin-recaptcha-container" ref={recaptchaContainerRef} aria-hidden="true" />

      {/* Header */}
      <div className="mb-5">
        <h2
          className="text-[21px] sm:text-[23px] font-bold text-[#14161f] tracking-tight"
          style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
        >
          Log in to your account
        </h2>
        <p className="text-[12.5px] sm:text-[13px] text-[#6e7385] mt-1">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      {/* Auth Method Selector Toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#f0e9dc] border border-[#e4dcce] rounded-xl mb-4">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("credentials");
            setFormError(null);
            clearError();
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
            authMethod === "credentials"
              ? "bg-white text-[#14161f] shadow-xs border border-[#dfd7c7]"
              : "text-[#6e7385] hover:text-[#14161f]"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMethod("phone");
            setFormError(null);
            clearError();
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
            authMethod === "phone"
              ? "bg-white text-[#14161f] shadow-xs border border-[#dfd7c7]"
              : "text-[#6e7385] hover:text-[#14161f]"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Phone OTP</span>
        </button>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded-xl flex items-start gap-2.5 text-[#9b1c1c] text-[12px] animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#e02424]" />
          <div className="flex-1 leading-relaxed">{activeError}</div>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              clearError();
            }}
            className="text-[#9b1c1c] hover:text-black cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Email / Password Form */}
      {authMethod === "credentials" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold text-[#2d313f]">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-[#989cb0] pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#e1dcd0] rounded-xl text-[13px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-semibold text-[#2d313f]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess(false);
                  setResetError(null);
                  setIsForgotModalOpen(true);
                }}
                className="text-[11.5px] font-semibold text-[#b8860b] hover:text-[#936b08] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-[#989cb0] pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#e1dcd0] rounded-xl text-[13px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer ${
                rememberMe
                  ? "bg-[#b8860b] border-[#a07408] text-white shadow-xs"
                  : "bg-white border-[#d5cfc2] hover:border-[#b8860b]"
              }`}
            >
              {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
            </button>
            <span
              onClick={() => setRememberMe(!rememberMe)}
              className="text-[12px] font-medium text-[#494e60] select-none cursor-pointer"
            >
              Remember me
            </span>
          </div>

          {/* Primary Log in Button */}
          <button
            type="submit"
            disabled={localLoading}
            className="group w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13.5px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-75 mt-2"
          >
            <span>{localLoading ? "Logging in..." : "Log in"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      )}

      {/* Dedicated Phone Number + OTP Section */}
      {authMethod === "phone" && (
        <div className="space-y-4">
          {phoneStep === "phone" ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-semibold text-[#2d313f]">
                    Administrative Phone
                  </label>
                  <span className="text-[10px] font-mono text-[#b8860b] uppercase tracking-wider bg-[#f3ede0] px-2 py-0.5 rounded-md border border-[#e5dfd2]">
                    Hardware SMS // E.164
                  </span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-[#989cb0] pointer-events-none">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="+1 555 019 2834"
                    disabled={phoneLoading}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e1dcd0] rounded-xl text-[13px] font-mono text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-[#7a7f92]">
                  <span>Include country dialing code</span>
                  <span className="font-mono text-[#989cb0]">+1 / +44 / +91</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneLoading || !phoneNumber.trim()}
                className="group w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13.5px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-75"
              >
                {phoneLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#dfba82]" />
                    <span>Dispatching Token...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#f3ede0] border border-[#e4dcce] rounded-xl text-center space-y-0.5">
                <span className="text-[10px] font-mono text-[#b8860b] uppercase tracking-wider">
                  Security Attestation Challenge
                </span>
                <p className="text-[12.5px] text-[#494e60]">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-mono font-bold text-[#14161f]">{phoneNumber}</span>
                </p>
              </div>

              <div className="py-1">
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  length={6}
                  disabled={phoneLoading}
                  autoFocus
                  hasError={Boolean(activeError)}
                  onComplete={(code) => handleVerifyPhoneOtp(code)}
                  variant="card"
                />
              </div>

              <button
                type="button"
                onClick={() => handleVerifyPhoneOtp()}
                disabled={phoneLoading || otpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13.5px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-75"
              >
                {phoneLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#dfba82]" />
                    <span>Validating Attestation...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-[#dfba82]" />
                    <span>Verify & Authenticate</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-[11.5px]">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("phone");
                    setOtpCode("");
                    setFormError(null);
                  }}
                  disabled={phoneLoading}
                  className="text-[#6e7385] hover:text-[#14161f] transition-colors cursor-pointer font-medium"
                >
                  ← Change number
                </button>

                {countdown > 0 ? (
                  <span className="font-mono text-[11px] text-[#8e93a6] bg-[#f0e9dc] px-2 py-0.5 rounded-md">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={phoneLoading}
                    className="text-[#b8860b] hover:text-[#8f6807] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="w-full border-t border-[#e2dcd0]" />
        <span className="absolute bg-[#fbf7ee] px-3 text-[10px] font-bold tracking-wider text-[#989cb0] uppercase">
          OR CONTINUE WITH
        </span>
      </div>

      {/* Social Logins */}
      <SocialAuthButtons />

      {/* Bottom Link */}
      <div className="text-center pt-3 text-[12px] text-[#6e7385]">
        <span>Don&apos;t have an account? </span>
        <Link
          href="/sign-up"
          className="font-bold text-[#b8860b] hover:text-[#8f6807] transition-colors underline-offset-2 hover:underline"
        >
          Sign up
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <h3 className="text-base font-semibold text-[#f4efe6]">
                Reset your password
              </h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-[#787d91] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="py-3 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#1e3a2f] border border-[#2d6a4f] flex items-center justify-center text-[#52b788]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-[13px] text-[#c5c9d6]">
                  Password reset link sent to{" "}
                  <span className="font-semibold text-white">{resetEmail}</span>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 bg-[#dfba82] text-black font-semibold rounded-xl text-xs hover:bg-[#ebd4aa] transition-colors cursor-pointer"
                >
                  Back to Log in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5">
                <p className="text-[12.5px] text-[#8e93a6]">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {resetError && (
                  <div className="p-2.5 bg-[#3b1219] border border-[#69202c] rounded-xl text-[#fca5a5] text-xs flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11.5px] font-medium text-[#c5c9d6]">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-[13px] text-white placeholder-[#686d80] focus:outline-none focus:border-[#dfba82]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-[#dfba82] text-black text-xs font-semibold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer disabled:opacity-75"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SignInCard;
