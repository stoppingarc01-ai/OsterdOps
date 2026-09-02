"use client";

import React, { useState } from "react";
import { X, Building2, Globe, Mail, Shield, Check } from "lucide-react";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgData: {
    name: string;
    domain: string;
    email: string;
    plan: string;
    members: number;
    projects: number;
  };
  onSave: (updated: {
    name: string;
    domain: string;
    email: string;
    plan: string;
  }) => void;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  orgData,
  onSave,
}: EditOrganizationModalProps) {
  const [name, setName] = useState(orgData.name);
  const [domain, setDomain] = useState(orgData.domain);
  const [email, setEmail] = useState(orgData.email);
  const [plan, setPlan] = useState(orgData.plan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSave({ name, domain, email, plan });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c0e17] border border-[#23273a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e2c] bg-[#090b12]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dfba82]/15 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Edit Organization Profile</h3>
              <p className="text-[11px] text-[#787d91]">Update company identity and billing contacts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787d91] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Organization Name */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Organization Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121522] border border-[#23273a] focus:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555b70] focus:outline-none transition-colors"
                placeholder="e.g. Workspace Name"
              />
            </div>
          </div>

          {/* Domain / Slug */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Workspace Domain Slug
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] focus-within:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors">
              <Globe className="w-3.5 h-3.5 text-[#787d91] mr-2 shrink-0" />
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 font-mono text-xs text-white placeholder-[#555b70]"
                placeholder="workspace.osterdops.com"
              />
            </div>
          </div>

          {/* Finance Email */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Billing & Notifications Email
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] focus-within:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#787d91] mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 text-xs text-white placeholder-[#555b70]"
                placeholder="billing@company.com"
              />
            </div>
          </div>

          {/* Tier / Plan */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Subscription Tier
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] focus-within:border-[#dfba82] rounded-xl px-3 py-2 text-xs text-white">
              <Shield className="w-3.5 h-3.5 text-[#dfba82] mr-2 shrink-0" />
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 text-xs text-white cursor-pointer"
              >
                <option value="Enterprise" className="bg-[#0c0e17] text-white">Enterprise (Custom SLA & SAML SSO)</option>
                <option value="Scale" className="bg-[#0c0e17] text-white">Scale ($499/mo)</option>
                <option value="Growth" className="bg-[#0c0e17] text-white">Growth ($149/mo)</option>
                <option value="Starter" className="bg-[#0c0e17] text-white">Starter (Free Sandbox)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b1e2c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8e93a6] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
