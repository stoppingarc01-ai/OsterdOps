"use client";

import React, { useState } from "react";
import {
  Check,
  CreditCard,
  DollarSign,
  Gift,
  Layers,
  Plus,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

export function AdminSubscriptionsView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [coupons, setCoupons] = useState<Array<{ code: string; discount: string; redemptions: number; status: string }>>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("25");

  const plans = [
    {
      id: "growth",
      name: "Growth Tier",
      priceMonthly: 49,
      priceAnnual: 39,
      tokenLimit: "25,000,000",
      features: [
        "Up to 25,000,000 monthly tokens",
        "5 Projects & 10 API Keys",
        "Micro-cent cost tracking",
        "Standard Slack & Email alerts",
      ],
    },
    {
      id: "scale",
      name: "Scale Tier",
      priceMonthly: 199,
      priceAnnual: 159,
      isPopular: true,
      tokenLimit: "250,000,000",
      features: [
        "Up to 250,000,000 monthly tokens",
        "Unlimited Projects & API Keys",
        "Sub-millisecond prompt caching",
        "Custom hard limits & budget circuit breakers",
        "SOC2 Compliance audit logs",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Custom",
      priceMonthly: 2400,
      priceAnnual: 1990,
      tokenLimit: "Unlimited",
      features: [
        "Bespoke token routing & volume discounts",
        "Dedicated VPC gateway deployment",
        "Custom SLA (99.99% uptime guarantee)",
        "SAML SSO & SCIM User Provisioning",
      ],
    },
  ];

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    setCoupons([
      ...coupons,
      {
        code: newCouponCode.toUpperCase().replace(/\s+/g, "_"),
        discount: `${newCouponDiscount}% off`,
        redemptions: 0,
        status: "ACTIVE",
      },
    ]);
    setNewCouponCode("");
    setIsCouponModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            Subscriptions &amp; Billing Engine
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Platform subscription tiers, token limits, and promotional discount codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141824] hover:bg-[#1b2234] border border-[#232c40] text-[#dfba82] text-[12px] font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Gift className="h-4 w-4" />
            <span>Create Promo Code</span>
          </button>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center bg-[#0c0f16] border border-[#1b202e] p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-colors cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#dfba82] text-[#07080c]"
                  : "text-[#717688] hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-colors cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-[#dfba82] text-[#07080c]"
                  : "text-[#717688] hover:text-white"
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#0c0f16] rounded-2xl p-6 relative border transition-all flex flex-col justify-between ${
              plan.isPopular
                ? "border-[#dfba82] shadow-[0_4px_24px_rgba(223,186,130,0.12)]"
                : "border-[#1b202e] hover:border-[#2b344a]"
            }`}
          >
            <div>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dfba82] text-[#07080c] font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold text-white">{plan.name}</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[34px] font-bold text-[#f4efe6] font-mono tracking-tight">
                  ${billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual}
                </span>
                <span className="text-[12px] text-[#717688]">/ month</span>
              </div>

              <ul className="space-y-2.5 text-[12px] text-[#c5c8d4] mb-6">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#dfba82] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#717688]">
              <span>Token Quota:</span>
              <span className="font-mono text-white font-semibold">{plan.tokenLimit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Section */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Active Promotion Codes</h3>
            <p className="text-xs text-[#717688] mt-0.5">
              Discount campaigns applied during customer onboarding and checkout.
            </p>
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#73788c] bg-[#07080c] rounded-xl border border-[#171b26]">
            No promotional coupon codes created. Click &quot;Create Promo Code&quot; to issue a new discount.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#717688] border-b border-[#171b26] pb-2">
                <tr>
                  <th className="pb-3">Coupon Code</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Redemptions</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171b26] text-white">
                {coupons.map((c) => (
                  <tr key={c.code}>
                    <td className="py-3 font-mono font-bold text-[#dfba82]">{c.code}</td>
                    <td className="py-3 text-[#c5c8d4]">{c.discount}</td>
                    <td className="py-3 font-mono">{c.redemptions}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Promo Code Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="text-white font-bold text-[16px]">Create Promotional Code</div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-[#717688] hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER_25"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd4aa]"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
