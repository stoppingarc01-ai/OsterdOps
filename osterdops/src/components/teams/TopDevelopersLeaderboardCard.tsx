"use client";

import React from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function TopDevelopersLeaderboardCard() {
  const { currentOrg } = useAuth();

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Developer Spenders</h3>
      </div>

      <div className="p-6 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824] space-y-2">
        <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
          <Users className="w-4 h-4" />
        </div>
        <div className="text-white font-medium">No developer spend records yet</div>
        <p className="text-[11px] text-[#73788c]">
          Individual developer attribution requires routing API requests with user tags.
        </p>
      </div>
    </div>
  );
}
