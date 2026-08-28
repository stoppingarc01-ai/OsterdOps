"use client";

import React, { useState } from "react";
import { X, Mail, MessageSquare, PhoneCall, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage("");
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-[#f4efe6]">Contact OsterdOps Support</h3>
          <p className="text-xs text-[#8e93a6] mt-1">
            Our enterprise AI engineers are online 24/7 to help setup your workspace.
          </p>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
                <Check className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-white">Message sent successfully!</div>
              <div className="text-xs text-[#8e93a6]">We will get back to your registered email shortly.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-3 bg-[#131624] border border-[#1f2336] rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer hover:border-[#dfba82]/50 transition-all">
                  <MessageSquare className="w-4 h-4 text-[#dfba82]" />
                  <span className="text-[11px] font-medium text-[#d1d5e3]">Live Chat</span>
                </div>
                <div className="p-3 bg-[#131624] border border-[#1f2336] rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer hover:border-[#dfba82]/50 transition-all">
                  <Mail className="w-4 h-4 text-[#dfba82]" />
                  <span className="text-[11px] font-medium text-[#d1d5e3]">Email Us</span>
                </div>
                <div className="p-3 bg-[#131624] border border-[#1f2336] rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer hover:border-[#dfba82]/50 transition-all">
                  <PhoneCall className="w-4 h-4 text-[#dfba82]" />
                  <span className="text-[11px] font-medium text-[#d1d5e3]">Book Call</span>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  How can we assist you with onboarding?
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Need assistance connecting custom Azure OpenAI endpoints..."
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl p-3 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
