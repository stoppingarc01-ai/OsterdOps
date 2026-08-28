"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div className="relative w-full min-h-screen">
      {/* Top Gold Glowing Route Progress Bar */}
      <motion.div
        key={`progress-${pathname}`}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#dfba82] via-[#f3ebd9] to-[#b8860b] shadow-[0_0_12px_rgba(223,186,130,0.8)] z-[9999] pointer-events-none"
      />

      {/* Main Page Transition Container */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10, scale: 0.996 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
