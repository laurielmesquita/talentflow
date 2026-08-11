"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Brain, CheckCircle2, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";

const signals = [
  { label: "Quality Score", value: "94", tone: "text-emerald-400" },
  { label: "Skills encontradas", value: "18", tone: "text-cyan-300" },
  { label: "Tempo poupado", value: "3h", tone: "text-amber-300" },
];

export default function HeroVisual() {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.7 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.7 });
  const visualX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const visualY = useTransform(springY, [-0.5, 0.5], [-8, 8]);
  const glowX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const glowY = useTransform(springY, [-0.5, 0.5], [-14, 14]);

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      className="relative w-full max-w-[640px] mx-auto lg:mx-0 lg:max-w-[680px]"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="absolute -inset-8 rounded-[3rem] bg-primary/20 blur-[80px] pointer-events-none"
        style={reducedMotion ? undefined : { x: glowX, y: glowY }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 20, delay: 0.15 }}
        style={reducedMotion ? undefined : { x: visualX, y: visualY, rotateY: visualX, rotateX: visualY }}
        className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#0b0a20]/70 shadow-2xl shadow-primary/20 will-change-transform"
      >
        <Image
          src="/visuals/hero/talentflow-hero.svg"
          alt="TalentFlow transforma currículos em sinais de decisão para recrutadores"
          width={920}
          height={780}
          priority
          className="h-auto w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-cyan-300/10 pointer-events-none" />

        <motion.div
          animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
          transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-950/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 shadow-lg backdrop-blur-xl"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          decisão explicável
        </motion.div>

        <motion.div
          animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
          transition={reducedMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-950/70 px-3 py-1.5 text-[11px] font-semibold text-indigo-100 shadow-lg backdrop-blur-xl"
        >
          <Brain className="h-3.5 w-3.5" />
          Groq + Gemini
        </motion.div>
      </motion.div>

      <div className="relative -mt-5 grid grid-cols-3 gap-2 px-5 sm:-mt-7 sm:px-10">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.45 + index * 0.1 }}
            className="glass-panel-strong rounded-2xl px-3 py-3 shadow-xl"
          >
            <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{signal.label}</p>
            <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${signal.tone}`}>{signal.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute -right-2 -top-5 hidden rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary shadow-lg backdrop-blur-xl sm:flex sm:items-center sm:gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        human + ai
      </div>
    </div>
  );
}
