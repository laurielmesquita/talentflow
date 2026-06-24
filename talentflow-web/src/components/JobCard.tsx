"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, Briefcase, Calendar, Edit, Trash2, Link2, ArrowRight 
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  work_model: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  application_email: string;
  application_subject: string;
  deadline: string;
  required_skills: string;
  is_active: boolean;
  created_at: string;
}

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onCopyLink: (job: Job) => void;
}

export default function JobCard({ job, onEdit, onDelete, onCopyLink }: JobCardProps) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const statusColor = job.is_active && !isExpired
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";

  const statusLabel = job.is_active && !isExpired ? "Ativa" : "Inativa/Encerrada";

  return (
    <div className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col justify-between min-h-[250px]">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${job.is_active && !isExpired ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {statusLabel}
            </span>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {job.title}
            </h3>
          </div>
        </div>

        {/* Metadados */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {job.work_model} • {job.employment_type}
          </span>
          {job.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Até {new Date(job.deadline).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        {/* Descrição resumida */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {job.required_skills ? (
            job.required_skills
              .split(",")
              .slice(0, 3)
              .map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-muted-foreground border border-slate-200 dark:border-white/10"
                >
                  {skill.trim()}
                </span>
              ))
          ) : (
            <span className="text-[10px] italic text-slate-400">Sem skills exigidas</span>
          )}
          {job.required_skills && job.required_skills.split(",").length > 3 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              +{job.required_skills.split(",").length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Ações no rodapé */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
        {/* Ações gerenciais rápidas */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(job)}
            title="Editar vaga"
            className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(job)}
            title="Excluir vaga"
            className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCopyLink(job)}
            title="Copiar link público"
            className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* Link para página de detalhes */}
        <Link
          href={`/jobs/${job.id}`}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Detalhes & Candidatos
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
