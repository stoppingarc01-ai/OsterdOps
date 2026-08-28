"use client";

import React from "react";
import { Headphones, Search, Code, Wrench } from "lucide-react";

export function TopProjectsCard() {
  const projects = [
    {
      name: "Support Agent",
      icon: Headphones,
      spend: "$1,830.24",
      requests: "68,231",
      costPerReq: "$0.0268",
    },
    {
      name: "Research Agent",
      icon: Search,
      spend: "$1,210.43",
      requests: "32,112",
      costPerReq: "$0.0377",
    },
    {
      name: "Coding Agent",
      icon: Code,
      spend: "$890.12",
      requests: "21,432",
      costPerReq: "$0.0415",
    },
    {
      name: "Internal Tools",
      icon: Wrench,
      spend: "$412.32",
      requests: "11,231",
      costPerReq: "$0.0367",
    },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Top Projects by Spend</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-medium">Project</th>
              <th className="pb-2.5 font-medium text-right">Spend</th>
              <th className="pb-2.5 font-medium text-right">Requests</th>
              <th className="pb-2.5 font-medium text-right">Cost / Request</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151826]">
            {projects.map((proj) => {
              const Icon = proj.icon;
              return (
                <tr key={proj.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-white tracking-tight">
                        {proj.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-white">
                    {proj.spend}
                  </td>
                  <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                    {proj.requests}
                  </td>
                  <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                    {proj.costPerReq}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
