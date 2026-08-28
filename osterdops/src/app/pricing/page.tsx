"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PricingSection } from "@/components/marketing/PricingSection";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function PricingPage() {
  const faqs = [
    {
      q: "How are requests and token counts measured?",
      a: "Requests represent each HTTP proxy call sent through OsterdOps. We track input and output tokens across OpenAI, Anthropic, Google, AWS Bedrock, and Mistral in real-time.",
    },
    {
      q: "Can I upgrade or downgrade plans anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from the Budgets & Billing settings. Changes take effect on your next billing date.",
    },
    {
      q: "What happens if our team exceeds monthly limits?",
      a: "By default, we send instant warnings to your Slack or email channels. On Growth and Scale plans, you can configure automatic throttling to cheaper models (like gpt-4o-mini) or hard stops.",
    },
    {
      q: "Is there a free trial for the Growth plan?",
      a: "Yes! You can start a 14-day free trial on the Growth plan with no credit card required upfront.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07080c] text-white selection:bg-[#dfba82] selection:text-black">
      <Navbar />

      <main className="flex-1 pt-12">
        <PricingSection />

        {/* Pricing FAQs Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#8e93a6]">
              Everything you need to know about OsterdOps plans and multi-model cost governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0d0f18] border border-[#1d202e] space-y-2 hover:border-[#dfba82]/40 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-white leading-snug">{faq.q}</h4>
                </div>
                <p className="text-xs text-[#8e93a6] leading-relaxed pl-6.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
