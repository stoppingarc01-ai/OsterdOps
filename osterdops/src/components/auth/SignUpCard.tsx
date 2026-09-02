"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  X,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { useAuth } from "@/context/AuthContext";
import { OtpInput } from "./OtpInput";

export function SignUpCard() {
  const router = useRouter();
  const { signUp, error: authError, clearError } = useAuth();

  // Mode Selection: Email vs Phone OTP
  const [authMethod, setAuthMethod] = useState<"credentials" | "phone">("credentials");

  // Standard Email Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"details" | "otp">("details");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Invisible Recaptcha Verifier Reference
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

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
    if (message.includes("auth/email-already-in-use")) {
      return "An account already exists with this email address.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network connection failure. Please check your connection.";
    }
    return message.replace(/^Firebase:\s*/i, "").replace(/\(auth\/[^)]+\)\.?/i, "").trim() || "Registration failed.";
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

    const container = document.getElementById("signup-recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    const verifier = new RecaptchaVerifier(auth, "signup-recaptcha-container", {
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

  // Dynamic password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "Enter a password" };
    if (password.length < 6) return { level: 1, text: "Weak password (min 6 characters)" };
    if (password.length < 10) return { level: 2, text: "Medium password" };
    return { level: 4, text: "Strong password" };
  };

  const strength = getPasswordStrength();

  // Email Submit Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setFormError(null);
    clearError();
    setLocalLoading(true);

    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: workEmail.trim(),
        companyName: companyName.trim() || "My Organization",
        password,
      });

      router.push("/onboarding");
    } catch (err: unknown) {
      setFormError(mapAuthError(err));
    } finally {
      setLocalLoading(false);
    }
  };

  // Phone Step 1: Send OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setFormError(null);
    clearError();

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setFormError("Please enter an administrative phone number.");
      return;
    }
    if (!cleanPhone.startsWith("+")) {
      setFormError("Please include international country code (e.g. +1 555 0199).");
      return;
    }
    if (!companyName.trim()) {
      setFormError("Please enter your organization name.");
      return;
    }

    setPhoneLoading(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      setConfirmationResult(confirmation);
      setPhoneStep("otp");
      setCountdown(60);
    } catch (err: unknown) {
      console.error("[OsterdOps SignUp] Phone OTP dispatch failed:", err);
      setFormError(mapAuthError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  // Phone Step 2: Confirm OTP & Bind Tenant Provisioning Contract
  const handleVerifyPhoneOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      setFormError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!confirmationResult) {
      setFormError("Verification session expired. Please start over.");
      setPhoneStep("details");
      return;
    }

    setPhoneLoading(true);
    setFormError(null);
    try {
      // 1. Confirm OTP code
      const credential = await confirmationResult.confirm(code);
      const user = credential.user;

      // 2. Set user display name
      const adminFullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Administrator";
      try {
        await updateProfile(user, { displayName: adminFullName });
      } catch {
        // Non-fatal
      }

      // 3. Obtain fresh ID Token
      const idToken = await user.getIdToken(true);

      // 4. Provision tenant via atomic registration API contract
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          name: adminFullName,
          organizationName: companyName.trim() || "My Organization",
          phone: phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to provision workspace account.");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[OsterdOps SignUp] Verification or registration failed:", err);
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

  const activeError = formError || authError;

  return (
    <div className="w-full max-w-[500px] bg-[#fbf7ee] text-[#1a1c24] rounded-[26px] p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(231,225,210,0.8)] transition-all relative">
      {/* Invisible container for Firebase Phone reCAPTCHA */}
      <div id="signup-recaptcha-container" ref={recaptchaContainerRef} aria-hidden="true" />

      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-[21px] sm:text-[23px] font-bold text-[#14161f] tracking-tight"
          style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
        >
          Create your account
        </h2>
        <p className="text-[12.5px] sm:text-[13px] text-[#6e7385] mt-1">
          Start your 14-day free trial. No credit card required.
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
        <div className="mb-3.5 p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded-xl flex items-start gap-2.5 text-[#9b1c1c] text-[12px] animate-in fade-in duration-200">
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

      {/* Standard Email / Password Form */}
      {authMethod === "credentials" && (
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {/* Name Fields (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                First name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="John"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                Last name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Doe"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>
          </div>

          {/* Work Email */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-semibold text-[#2d313f]">
              Work email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
              <input
                type="email"
                required
                value={workEmail}
                onChange={(e) => {
                  setWorkEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-semibold text-[#2d313f]">
              Company name
            </label>
            <div className="relative flex items-center">
              <Building className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Your Company Name"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-semibold text-[#2d313f]">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#989cb0] hover:text-[#555a6d] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Password Strength Meter */}
            <div className="pt-1">
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-full rounded-full transition-all duration-300 ${
                      seg <= strength.level
                        ? "bg-[#b8860b]"
                        : "bg-[#e5dfd2]"
                    }`}
                  />
                ))}
              </div>
              <span className="block text-[10px] font-medium text-[#6e7385] mt-1">
                {strength.text}
              </span>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreedToTerms}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                agreedToTerms
                  ? "bg-[#b8860b] border-[#a07408] text-white shadow-xs"
                  : "bg-white border-[#d5cfc2] hover:border-[#b8860b]"
              }`}
            >
              {agreedToTerms && <Check className="h-3 w-3 stroke-[3]" />}
            </button>
            <span className="text-[11.5px] leading-tight text-[#494e60] select-none">
              I agree to the{" "}
              <a href="#" className="font-semibold text-[#b8860b] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-[#b8860b] hover:underline">
                Privacy Policy
              </a>
            </span>
          </div>

          {/* Create Account Primary Button */}
          <button
            type="submit"
            disabled={localLoading || !agreedToTerms}
            className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-70 mt-1"
          >
            <span>{localLoading ? "Creating account..." : "Create account"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      )}

      {/* Dedicated Phone Number + OTP Section */}
      {authMethod === "phone" && (
        <div className="space-y-3.5">
          {phoneStep === "details" ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-3">
              {/* Name Fields (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                    First name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="John"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                    Last name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="Doe"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Name */}
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                  Company / Organization
                </label>
                <div className="relative flex items-center">
                  <Building className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Acme AI Technologies"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11.5px] font-semibold text-[#2d313f]">
                    Admin phone number
                  </label>
                  <span className="text-[10px] font-mono text-[#b8860b] uppercase tracking-wider bg-[#f3ede0] px-2 py-0.5 rounded-md border border-[#e5dfd2]">
                    Hardware OTP // E.164
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Smartphone className="absolute left-3 h-3.5 w-3.5 text-[#989cb0] pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="+1 555 019 9234"
                    disabled={phoneLoading}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1dcd0] rounded-xl text-[12.5px] font-mono text-[#1a1c24] placeholder-[#9ca1b3] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-[#7a7f92]">
                  Must include international dialing prefix (e.g. +1, +44, +91)
                </p>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreedToTerms}
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                    agreedToTerms
                      ? "bg-[#b8860b] border-[#a07408] text-white shadow-xs"
                      : "bg-white border-[#d5cfc2] hover:border-[#b8860b]"
                  }`}
                >
                  {agreedToTerms && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
                <span className="text-[11.5px] leading-tight text-[#494e60] select-none">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-[#b8860b] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-semibold text-[#b8860b] hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={phoneLoading || !agreedToTerms || !phoneNumber.trim()}
                className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-70 mt-1"
              >
                <span>{phoneLoading ? "Sending Code..." : "Send Verification Code"}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#f3ede0] border border-[#e4dcce] rounded-xl space-y-1.5 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#b8860b] uppercase tracking-wider">
                    Provisioning Scope
                  </span>
                  <span className="text-[10px] font-mono text-[#555a6d] bg-white px-1.5 py-0.5 rounded border border-[#dfd7c7]">
                    OWNER Privileges
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6e7385]">
                  <span>Organization</span>
                  <span className="font-semibold text-[#14161f]">{companyName}</span>
                </div>
                <div className="flex items-center justify-between text-[#6e7385]">
                  <span>Authorized Target</span>
                  <span className="font-mono font-semibold text-[#b8860b]">{phoneNumber}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[12px] text-[#6e7385]">
                  Enter the 6-digit attestation code sent to your phone
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-70"
              >
                {phoneLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#dfba82]" />
                    <span>Provisioning Tenant...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#dfba82]" />
                    <span>Verify & Provision Workspace</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-[11.5px]">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("details");
                    setOtpCode("");
                    setFormError(null);
                  }}
                  disabled={phoneLoading}
                  className="text-[#6e7385] hover:text-[#14161f] transition-colors cursor-pointer font-medium"
                >
                  ← Edit details
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
                    <span>Resend code</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-[#e2dcd0]" />
        <span className="absolute bg-[#fbf7ee] px-3 text-[9.5px] font-bold tracking-wider text-[#989cb0] uppercase">
          OR SIGN UP WITH
        </span>
      </div>

      {/* Social Buttons */}
      <SocialAuthButtons />

      {/* Sign in link */}
      <div className="text-center pt-2 text-[12px] text-[#6e7385]">
        <span>Already have an account? </span>
        <Link
          href="/sign-in"
          className="font-bold text-[#b8860b] hover:text-[#8f6807] transition-colors underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default SignUpCard;
