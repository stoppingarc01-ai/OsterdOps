"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Check } from "lucide-react";
import { SocialAuthButtons } from "./SocialAuthButtons";

export function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/";
    }, 800);
  };

  return (
    <div className="w-full max-w-[480px] bg-[#fbf7ee] text-[#1a1c24] rounded-[26px] p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(231,225,210,0.8)] transition-all">
      {/* Header */}
      <div className="mb-6">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@acmecorp.com"
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
            <a
              href="#"
              className="text-[11.5px] font-semibold text-[#b8860b] hover:text-[#936b08] transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-[#989cb0] pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          disabled={isLoading}
          className="group w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#101218] hover:bg-[#1c1f2a] text-[#fbf7ee] text-[13.5px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-75 mt-2"
        >
          <span>{isLoading ? "Logging in..." : "Log in"}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

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
      </form>
    </div>
  );
}
