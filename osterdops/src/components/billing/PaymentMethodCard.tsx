"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function PaymentMethodCard() {
  const { userProfile, user } = useAuth();
  const [hasCard, setHasCard] = useState(false);

  const cardholderName = userProfile?.name || user?.displayName || "Cardholder";

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Payment Method</h3>
        {hasCard ? (
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 text-[10px] font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Default</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-[#dfba82]/10 text-[#dfba82] border border-[#dfba82]/30 text-[10px] font-bold">
            Not Attached
          </span>
        )}
      </div>

      {hasCard ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1f30] via-[#10121d] to-[#0a0b12] border border-[#2c3046] shadow-xl space-y-4 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfba82]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <CreditCard className="w-6 h-6 text-[#dfba82]" />
            <span className="font-mono font-bold tracking-widest text-sm text-[#e8eaf0]">CARD</span>
          </div>

          <div className="space-y-1">
            <div className="font-mono tracking-widest text-base font-semibold text-[#f4efe6]">
              •••• •••• •••• 0000
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-[#8e93a6] font-mono pt-1">
              <span>{cardholderName}</span>
              <span>Exp: —/—</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#090b12] border border-[#161824] text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No payment method attached</div>
          <p className="text-[11px] text-[#73788c] max-w-xs mx-auto">
            Add a credit card or connect corporate billing to support continuous gateway capacity.
          </p>
        </div>
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setHasCard(true)}
          className="w-full py-2 rounded-xl border border-[#232738] bg-[#121422] hover:bg-[#1a1d2e] text-[#c5c9d6] hover:text-white text-xs font-semibold transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{hasCard ? "Update Card" : "Add Payment Method"}</span>
        </button>
      </div>
    </div>
  );
}
