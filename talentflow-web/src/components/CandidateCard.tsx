"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Trash2, ChevronDown } from "lucide-react";

function QualityGauge({ score, tier }: { score: number | null; tier: string | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground italic">—</span>;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const configs = {
    high:   { color: "text-emerald-500 dark:text-emerald-400", stroke: "stroke-emerald-500" },
    medium: { color: "text-amber-500 dark:text-amber-400", stroke: "stroke-amber-500" },
    low:    { color: "text-rose-500 dark:text-rose-400", stroke: "stroke-rose-500" },
  };
  const cfg = configs[tier as keyof typeof configs] || configs.low;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="transparent" strokeWidth="4" className="stroke-border/40" />
        <motion.circle
          cx="24" cy="24" r={radius} fill="transparent" strokeWidth="4"
          className={cfg.stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold font-mono tabular-nums ${cfg.color}`}>{score}</span>
    </div>
  );
}

export default function CandidateCard({ 
  cand, 
  isNew, 
  onDelete, 
  onViewProfile 
}: { 
  cand: any; 
  isNew: boolean; 
  onDelete: () => void;
  onViewProfile: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  } as const;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`group relative rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:border-border hover:bg-accent/40 ${
        isNew ? 'border-primary ring-1 ring-primary/40' : 'border-border/60'
      } ${cand.is_flagged ? 'bg-destructive/5 border-destructive/40' : 'bg-card'}`}
    >
      {/* Header / Summary */}
      <div 
        className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Name & Role (Left) */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {cand.photo_url ? (
            <img src={cand.photo_url} alt={cand.full_name} className="w-10 h-10 rounded-full object-cover border border-border/60 ring-1 ring-border/50 shadow-xs" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground border border-border/60 ring-1 ring-border/50 shadow-xs shrink-0">
              {cand.full_name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground truncate">{cand.full_name}</h3>
              {cand.is_flagged && (
                <span title={`Sinalizado: ${cand.flagged_reason}`}>
                  <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{cand.current_job || 'Não informado'}</p>
          </div>
        </div>

        {/* Central Skills Column (Staggered on load) */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="hidden lg:flex flex-wrap items-center gap-1.5 flex-[1.5]"
        >
          {cand.skills.slice(0, 4).map((skill: string, index: number) => (
            <motion.span 
              key={index}
              variants={itemVariants}
              className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider border border-border/40"
            >
              {skill}
            </motion.span>
          ))}
          {cand.skills.length > 4 && (
            <motion.span variants={itemVariants} className="text-[10px] text-muted-foreground font-medium px-1">
              +{cand.skills.length - 4} skills
            </motion.span>
          )}
        </motion.div>

        {/* Actions & Score (Right) */}
        <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
          <QualityGauge score={cand.quality_score} tier={cand.quality_tier} />
          
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
              title="Excluir Candidato"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <motion.div 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-1 rounded-md text-muted-foreground"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="border-t border-border/40 bg-muted/30"
          >
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                {cand.skills.length > 4 ? (
                   <div className="flex flex-wrap gap-1.5">
                     {cand.skills.slice(4).map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider border border-border/40">
                          {skill}
                        </span>
                     ))}
                   </div>
                ) : (
                  <span className="text-xs text-muted-foreground">O candidato não possui mais skills a serem exibidas.</span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                className="text-xs px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-all shadow-xs hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Ver Perfil Completo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

