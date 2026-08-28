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
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [coupons, setCoupons] = useState([
    { code: "STARTUP_BOOST_50", discount: "50% off for 3 months", redemptions: 124, status: "ACTIVE" },
    { code: "FINOPS_SUMMIT_2025", discount: "20% lifetime off Scale", redemptions: 89, status: "ACTIVE" },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("25");

  const plans = [
    {
      id: "growth",
      name: "Growth Tier",
      priceMonthly: 49,
      priceAnnual: 39,
      activeSubscribers: 542,
      mrrContribution: "$26,558",
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
      activeSubscribers: 263,
      mrrContribution: "$52,337",
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
      activeSubscribers: 42,
      mrrContribution: "$100,800",
      tokenLimit: "Unlimited",
      features: [
        "Bespoke token routing & volume discounts",
        "Dedicated isolated VPC gateway",
        "Custom model fine-tune tracking",
        "24/7 SLA with designated FinOps architect",
      ],
    },
  ];

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    setCoupons([
      ...coupons,
      {
        code: newCouponCode.toUpperCase(),
        discount: `${newCouponDiscount}% off`,
        redemptions: 0,
        status: "ACTIVE",
      },
    ]);
    setIsCouponModalOpen(false);
    setNewCouponCode("");
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            Subscriptions &amp; Billing Engine
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Manage subscription tiers, MRR contributions, automated tier upgrades, and promotion codes.
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
                  Highest Growth
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold text-white">{plan.name}</h3>
                <div className="text-[11px] font-mono text-[#dfba82] bg-[#dfba82]/10 border border-[#dfba82]/20 px-2 py-0.5 rounded">
                  {plan.activeSubscribers} Active
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[34px] font-bold text-[#f4efe6] font-mono tracking-tight">
                  ${billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual}
                </span>
                <span className="text-[12px] text-[#717688]">/ month</span>
              </div>

              <div className="p-3 rounded-xl bg-[#121622] border border-[#1d2232] mb-6 flex items-center justify-between text-[11.5px]">
                <span className="text-[#8e94a8]">MRR Contribution:</span>
                <span className="font-bold text-[#22c55e] font-mono">{plan.mrrContribution}</span>
              </div>

              <ul className="space-y-2.5 text-[12px] text-[#c5c8d4] mb-6">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#dfba82] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlanForEdit(plan.name)}
              className="w-full py-2.5 bg-[#161a26] hover:bg-[#1f2536] border border-[#273048] hover:border-[#dfba82]/50 text-[#f4efe6] font-semibold text-[12.5px] rounded-xl transition-colors cursor-pointer"
            >
              Configure Tier Limits
            </button>
          </div>
        ))}
      </div>

      {/* Active Promotion Codes Table */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#dfba82]" />
            <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">
              Active Promotion &amp; Discount Codes
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Promo Code</th>
                <th className="pb-3">Discount Details</th>
                <th className="pb-3">Redemptions</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {coupons.map((c, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-mono font-bold text-[#dfba82]">{c.code}</td>
                  <td className="py-3.5 text-[#e4e0d8]">{c.discount}</td>
                  <td className="py-3.5 font-mono text-[#38bdf8]">{c.redemptions} users</td>
                  <td className="py-3.5 text-right">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo Code Creator Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-[16px]">
                <Gift className="h-4 w-4 text-[#dfba82]" />
                <span>Issue New Promo Code</span>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 text-[#6c7285] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. YC_STARTUP_2025"
                  className="w-full bg-[#131722] border border-[#22283a] text-white uppercase font-mono text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  required
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1c2232]">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-[12.5px] text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Activate Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Limits Configurator Modal */}
      {selectedPlanForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="text-white font-bold text-[16px]">
                Configure Limits: <span className="text-[#dfba82]">{selectedPlanForEdit}</span>
              </div>
              <button
                onClick={() => setSelectedPlanForEdit(null)}
                className="p-1 text-[#6c7285] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-[12.5px]">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#8e94a8] mb-1">
                  Monthly Token Soft Allowance
                </label>
                <input
                  type="text"
                  defaultValue="25,000,000 tokens"
                  className="w-full bg-[#131722] border border-[#22283a] text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8e94a8] mb-1">
                  Overage Rate per 1M Tokens ($ USD)
                </label>
                <input
                  type="text"
                  defaultValue="$0.12 / 1M tokens"
                  className="w-full bg-[#131722] border border-[#22283a] text-white rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1c2232]">
              <button
                onClick={() => setSelectedPlanForEdit(null)}
                className="px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl cursor-pointer"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
