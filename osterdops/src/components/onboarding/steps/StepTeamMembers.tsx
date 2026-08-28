"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, X, UserPlus, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData, TeamMember } from "../types";

interface StepTeamMembersProps {
  data: OnboardingData;
  onChange: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ROLES: Array<TeamMember["role"]> = ["Admin", "Editor", "Viewer"];

export function StepTeamMembers({
  data,
  onChange,
  onNext,
  onBack,
}: StepTeamMembersProps) {
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<TeamMember["role"]>("Viewer");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Derive name from email username
    const username = emailInput.split("@")[0] || "Team Member";
    const formattedName = username
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: formattedName,
      email: emailInput.trim(),
      role: roleInput,
      avatarBg: "#dfba82",
    };

    onChange({ teamMembers: [...data.teamMembers, newMember] });
    setEmailInput("");
  };

  const handleRemoveMember = (id: string) => {
    const updated = data.teamMembers.filter((m) => m.id !== id);
    onChange({ teamMembers: updated });
  };

  // Helper for 2-letter initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        <h2
          className="text-[28px] sm:text-[32px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Invite your team.
        </h2>
        <p className="text-[13.5px] text-[#8e93a6]">
          Bring your engineering, finance and platform teams into OsterdOps.
        </p>
      </motion.div>

      {/* Form Bar: Invite email + role + button */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onSubmit={handleAddMember}
        className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-[#0d0f18] border border-[#1d202e] rounded-2xl"
      >
        <div className="flex-1 w-full relative">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter work email"
            className="w-full bg-transparent px-4 py-2 text-[13px] text-white placeholder-[#52576b] focus:outline-none"
          />
        </div>

        {/* Role Select */}
        <div className="relative w-full sm:w-36">
          <select
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value as TeamMember["role"])}
            className="w-full bg-[#141724] border border-[#232738] rounded-xl px-3 py-2 text-[12.5px] text-[#e8eaf0] focus:outline-none focus:border-[#dfba82] appearance-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#0d0f18]">
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Invite Button */}
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          Invite
        </button>
      </motion.form>

      {/* Invited Members Table List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="text-[11.5px] font-semibold text-[#6e7387] uppercase tracking-wider">
          Invited Members ({data.teamMembers.length})
        </div>

        <div className="bg-[#0d0f18] border border-[#1d202e] rounded-2xl divide-y divide-[#171a27] overflow-hidden">
          {data.teamMembers.map((member) => {
            const initials = getInitials(member.name);

            return (
              <div
                key={member.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#111320] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#202436] border border-[#2e334a] text-[#dfba82] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {member.isYou && (
                        <span className="text-[11px] font-normal text-[#8e93a6]">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-[#6e7387]">{member.email}</div>
                  </div>
                </div>

                {/* Right: Role Pill & Remove */}
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-[#161826] border border-[#25283b] text-[11px] font-medium text-[#c5c9d6]">
                    {member.role}
                  </span>

                  {!member.isYou ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-[#6e7387] hover:text-[#ef4444] p-1 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#c5c9d6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#8e93a6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(223,186,130,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
