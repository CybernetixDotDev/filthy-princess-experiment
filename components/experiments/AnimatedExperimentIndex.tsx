"use client";

import type { ReactNode } from "react";

import { motion } from "@/lib/animation/motion";

export function AnimatedExperimentIndex({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
