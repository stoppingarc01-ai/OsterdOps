"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface ContentTransitionProps {
  children: React.ReactNode;
}

export function ContentTransition({ children }: ContentTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startTimer = setTimeout(() => {
      if (isMounted) setIsLoading(true);
    }, 0);
    const endTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname]);

  return (
    <div className="relative w-full h-full">
      {/* Top Gold Progress Glow Indicator (Applies only to content area) */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#dfba82] via-[#f3ebd9] to-[#b8860b] shadow-[0_0_10px_rgba(223,186,130,0.8)] z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Content Animation Container - Smooth Page Change */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
