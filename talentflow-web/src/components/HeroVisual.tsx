"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, Loader2, Sparkles, CheckCircle2, Brain } from "lucide-react";

type Phase = "idle" | "processing" | "done";

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

const EXTRACTED = {
  name: "Ana Carvalho",
  role: "Product Designer Sr.",
  company: "Nubank → VTEX",
  skills: ["Figma", "Design Systems", "UX Research"],
  score: 94,
};

const STEPS = [
  "Extraindo texto (Groq / Llama 3.3)",
  "Estruturando perfil e experiências",
  "Calculando Quality Score",
];

export default function HeroVisual() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    async function loop() {
      // Phase 1: Idle - waiting for PDF
      setPhase("idle");
      setActiveStep(0);
      await sleep(1800);

      // Phase 2: Processing with step-by-step sequential animation
      setPhase("processing");
      setActiveStep(0);
      await sleep(950);

      setActiveStep(1);
      await sleep(950);

      setActiveStep(2);
      await sleep(1000);

      // Phase 3: Completed - displaying profile
      setPhase("done");
      await sleep(5000);
    }
    loop();
    const id = setInterval(loop, 11000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto lg:max-w-md">
      {/* Ambient glow behind the card */}
      <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[60px] scale-110 pointer-events-none" />

      {/* ── Terminal card — cores explícitas para funcionar em qualquer tema ── */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
        style={{ background: "oklch(0.13 0.035 260)", border: "1px solid oklch(1 0 0 / 10%)" }}
      >
        {/* Terminal chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", background: "oklch(0.10 0.03 260)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          <span className="ml-2 text-[11px] font-mono tracking-wide" style={{ color: "oklch(1 0 0 / 25%)" }}>
            talentflow — motor de triagem
          </span>
        </div>

        {/* Content area */}
        <div className="p-6 min-h-[260px] flex flex-col justify-center">
          <AnimatePresence mode="wait">

            {/* ─── IDLE ─── */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl animate-pulse" />
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "oklch(0.65 0.25 260 / 15%)", border: "1px solid oklch(0.65 0.25 260 / 30%)" }}
                  >
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-mono" style={{ color: "oklch(1 0 0 / 50%)" }}>
                    Aguardando currículo...
                  </p>
                  <p className="text-xs font-mono mt-1" style={{ color: "oklch(1 0 0 / 25%)" }}>
                    curriculo_ana_carvalho.pdf
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── PROCESSING ─── */}
            {phase === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4 justify-center"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Brain className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                  <span className="text-sm text-indigo-400 font-mono">Processando com IA...</span>
                </div>
                {STEPS.map((step, i) => {
                  const isDone = i < activeStep;
                  const isActive = i === activeStep;
                  const isPending = i > activeStep;

                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="shrink-0 flex items-center justify-center w-4 h-4">
                        {isDone && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isActive && (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                        )}
                        {isPending && (
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-transparent shrink-0" />
                        )}
                      </div>
                      <span
                        className="text-xs font-mono transition-colors duration-300"
                        style={{
                          color: isDone || isActive
                            ? "oklch(0.97 0.005 260)"
                            : "oklch(1 0 0 / 45%)",
                        }}
                      >
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ─── DONE ─── */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">
                    Perfil Estruturado
                  </span>
                </div>

                {/* Identity */}
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "oklch(1 0 0 / 5%)", border: "1px solid oklch(1 0 0 / 10%)" }}
                >
                  <p className="text-sm font-bold" style={{ color: "oklch(0.97 0.005 260)" }}>
                    {EXTRACTED.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "oklch(1 0 0 / 45%)" }}>
                    {EXTRACTED.role} · {EXTRACTED.company}
                  </p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {EXTRACTED.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2 py-0.5 rounded-full font-mono"
                      style={{
                        background: "oklch(0.65 0.25 260 / 20%)",
                        border: "1px solid oklch(0.65 0.25 260 / 35%)",
                        color: "oklch(0.75 0.2 260)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Score */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: "oklch(0.6 0.18 160 / 12%)", border: "1px solid oklch(0.6 0.18 160 / 25%)" }}
                >
                  <span className="text-xs font-mono" style={{ color: "oklch(1 0 0 / 45%)" }}>
                    Quality Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-emerald-400">{EXTRACTED.score}</span>
                    <span className="text-xs text-emerald-400/60">/100</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 shadow-lg whitespace-nowrap z-10"
      >
        ✓ em segundos
      </motion.div>

      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 shadow-lg whitespace-nowrap z-10"
      >
        🧠 Groq + Gemini
      </motion.div>
    </div>
  );
}
