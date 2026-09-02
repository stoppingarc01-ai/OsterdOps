"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Building, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, X } from "lucide-react";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { useAuth } from "@/context/AuthContext";

export function SignUpCard() {
  const router = useRouter();
  const { signUp, error: authError, clearError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "Enter a password" };
    if (password.length < 6) return { level: 1, text: "Weak password (min 6 characters)" };
    if (password.length < 10) return { level: 2, text: "Medium password" };
    return { level: 4, text: "Strong password" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
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
      setFormError((err as Error).message || "Registration failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div className="w-full max-w-[500px] bg-[#fbf7ee] text-[#1a1c24] rounded-[26px] p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(231,225,210,0.8)] transition-all">
      {/* Header */}
      <div className="mb-5">
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

      {/* Error Alert */}
      {activeError && (
        <div className="mb-3.5 p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded-xl flex items-start gap-2.5 text-[#9b1c1c] text-[12px] animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#e02424]" />
          <div className="flex-1">{activeError}</div>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
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
      </form>
    </div>
  );
}
