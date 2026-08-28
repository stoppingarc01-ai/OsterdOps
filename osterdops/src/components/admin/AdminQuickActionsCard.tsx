"use client";

import React from "react";
import {
  ChevronRight,
  CreditCard,
  Edit3,
  Headphones,
  Users,
} from "lucide-react";

interface AdminQuickActionsCardProps {
  onSelectAction?: (actionId: string) => void;
}

export function AdminQuickActionsCard({ onSelectAction }: AdminQuickActionsCardProps) {
  const actions = [
    {
      id: "create_post",
      title: "+ Create Blog Post",
      desc: "Publish news and updates",
      icon: Edit3,
    },
    {
      id: "support",
      title: "View Support Inbox",
      desc: "Manage customer tickets",
      icon: Headphones,
    },
    {
      id: "subscriptions",
      title: "View Subscriptions",
      desc: "Manage plans & billing",
      icon: CreditCard,
    },
    {
      id: "customers",
      title: "Manage Customers",
      desc: "View and manage customers",
      icon: Users,
    },
  ];

  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans shadow-sm">
      <h3 className="text-[12.5px] font-bold tracking-[0.12em] text-[#e8e4dc] uppercase mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => onSelectAction && onSelectAction(action.id)}
              className="bg-[#11141e] hover:bg-[#161a26] border border-[#1d2334] hover:border-[#dfba82]/40 p-4 rounded-xl flex items-center justify-between text-left transition-all duration-150 group shadow-sm w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[12.5px] font-bold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors leading-tight">
                    {action.title}
                  </div>
                  <div className="text-[10.5px] text-[#717688] mt-0.5">
                    {action.desc}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-[#555a6d] group-hover:text-white transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
