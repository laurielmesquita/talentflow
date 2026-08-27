"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, Briefcase, Calendar, Edit, Trash2, Link2, ArrowRight 
} from "lucide-react";

import type { Job } from "@/types";


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
    <div className="group relative glass-panel glass-panel-interactive border-l-2 border-l-primary p-6 flex flex-col justify-between min-h-[250px]">

      <div className="relative z-10 space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold border ${statusColor}`}>
              <span className={`w-1.5 h-1.5 ${job.is_active && !isExpired ? "bg-success" : "bg-muted-foreground"}`} />
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
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {job.location}
            </span>
          )}
            <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            {job.work_model} • {job.employment_type}
          </span>
          {job.deadline && (
              <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
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
                  className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-secondary text-muted-foreground border border-border"
                >
                  {skill.trim()}
                </span>
              ))
          ) : (
            <span className="text-[10px] italic text-muted-foreground">Sem skills exigidas</span>
          )}
          {job.required_skills && job.required_skills.split(",").length > 3 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              +{job.required_skills.split(",").length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Ações no rodapé */}
      <div className="relative z-10 flex items-center justify-between border-t border-border pt-4 mt-6">
        {/* Ações gerenciais rápidas */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(job)}
            title="Editar vaga"
            className="p-2 bg-secondary hover:bg-accent text-muted-foreground hover:text-primary border border-border transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(job)}
            title="Excluir vaga"
            className="p-2 bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCopyLink(job)}
            title="Copiar link público"
            className="p-2 bg-secondary hover:bg-accent text-muted-foreground hover:text-primary border border-border transition-all cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* Link para página de detalhes */}
        <Link
          href={`/jobs/${job.slug || job.id}`}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Detalhes & Candidatos
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
