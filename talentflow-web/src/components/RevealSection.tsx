"use client";

import { motion, type TargetAndTransition, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealVariant = "fade" | "slide-up" | "scale" | "slide-right" | "slide-left";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  variant?: RevealVariant;
}

const variants: Record<RevealVariant, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  "slide-up": { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
  scale: { initial: { opacity: 0, scale: 0.94, y: 16 }, animate: { opacity: 1, scale: 1, y: 0 } },
  "slide-right": { initial: { opacity: 0, x: -32 }, animate: { opacity: 1, x: 0 } },
  "slide-left": { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 } },
};

export default function RevealSection({
  children,
  className,
  delay = 0,
  yOffset,
  variant = "slide-up",
}: RevealSectionProps) {
  const reducedMotion = useReducedMotion();

  const resolved = variants[variant] ?? variants["slide-up"];
  const initial: TargetAndTransition = yOffset !== undefined ? { opacity: 0, y: yOffset } : resolved.initial;
  const animate: TargetAndTransition = reducedMotion || yOffset !== undefined ? { opacity: 1, y: 0 } : resolved.animate;

  return (
    <motion.div
      initial={initial}
      whileInView={reducedMotion ? { opacity: 1, y: 0 } : animate}
      viewport={{ once: true, margin: "-80px" }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
