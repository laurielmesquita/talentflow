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
    high:   { color: "text-[#10b981]", stroke: "stroke-[#10b981]" },
    medium: { color: "text-[#f59e0b]", stroke: "stroke-[#f59e0b]" },
    low:    { color: "text-[#f43f5e]", stroke: "stroke-[#f43f5e]" },
  };
  const cfg = configs[tier as keyof typeof configs] || configs.low;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="transparent" stroke="currentColor" strokeWidth="4" className="text-border" />
        <motion.circle
          cx="24" cy="24" r={radius} fill="transparent" strokeWidth="4"
          className={cfg.stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${cfg.color}`}>{score}</span>
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
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border transition-all duration-300 overflow-hidden ring-1 ring-white/10 hover:bg-primary/5 ${
        isNew ? 'border-primary ring-primary/50' : 'border-white/5'
      } ${cand.is_flagged ? 'bg-destructive/5 border-destructive/50' : 'bg-card'}`}
    >
      {/* Header / Summary */}
      <div 
        className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Name & Role (Left) */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {cand.photo_url ? (
            <img src={cand.photo_url} alt={cand.full_name} className="w-12 h-12 rounded-full object-cover border border-border shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border shadow-sm shrink-0">
              {cand.full_name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{cand.full_name}</h3>
              {cand.is_flagged && (
                <span title={`Sinalizado: ${cand.flagged_reason}`}>
                  <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{cand.current_job || 'Não informado'}</p>
          </div>
        </div>

        {/* Central Skills Column (Staggered on load) */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="hidden lg:flex flex-wrap items-center gap-2 flex-[1.5]"
        >
          {cand.skills.slice(0, 4).map((skill: string, index: number) => (
            <motion.span 
              key={index}
              variants={itemVariants}
              className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider border border-primary/20 shadow-sm"
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
        <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
          <QualityGauge score={cand.quality_score} tier={cand.quality_tier} />
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              title="Excluir Candidato"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="border-t border-white/5 bg-black/5 dark:bg-white/5"
          >
            <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                {cand.skills.length > 4 ? (
                   <div className="flex flex-wrap gap-2">
                     {cand.skills.slice(4).map((skill: string, index: number) => (
                        <span key={index} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider border border-border shadow-sm">
                          {skill}
                        </span>
                     ))}
                   </div>
                ) : (
                  <span className="text-sm text-muted-foreground">O candidato não possui mais skills a serem exibidas.</span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                className="text-sm px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 whitespace-nowrap"
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
