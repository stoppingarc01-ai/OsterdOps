"use client";

import React from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface AdminSupportActivityCardProps {
  onGoToInbox?: () => void;
}

export function AdminSupportActivityCard({ onGoToInbox }: AdminSupportActivityCardProps) {
  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Support Activity</h3>
        <span className="text-xs text-[#717688]">Live Feed</span>
      </div>

      <div className="p-10 text-center text-xs text-[#73788c] bg-[#080a0f] rounded-xl border border-[#141724] space-y-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-white font-semibold">Inbox Zero</div>
        <p className="text-[11px] text-[#73788c]">
          No pending customer support inquiries requiring administrator review.
        </p>
      </div>
    </div>
  );
}
