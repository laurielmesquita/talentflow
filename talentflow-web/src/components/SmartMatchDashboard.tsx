"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, MapPin, Target, Calendar, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import JobMatchViewer from "./JobMatchViewer";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import type { Job } from "@/types";

export default function SmartMatchDashboard({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // URL Search Params sync
  const jobId = searchParams.get("jobId") || undefined;

  // Local State
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [activeTab, setActiveTab] = useState<"matches" | "details">("matches");

  // Sync props to state
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const selectedJob = jobs.find((j) => j.id === jobId);

  const handleSelectJob = (id: string) => {
    router.push(`${pathname}?jobId=${id}`, { scroll: false });
  };

  // Auxiliares de Formatação de Texto
  function formatListText(text?: string) {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
        {lines.map((line, idx) => {
          const cleaned = line.replace(/^[•\-\*\s]+/, "").trim();
          if (!cleaned) return null;
          return <li key={idx} className="leading-relaxed">{cleaned}</li>;
        })}
      </ul>
    );
  }

  function renderTextOrList(text?: string) {
    if (!text) return <p className="text-muted-foreground italic text-xs">Não informado.</p>;
    if (text.includes("•") || text.includes("\n-") || text.includes("\n*") || text.split("\n").length > 2) {
      return formatListText(text);
    }
    return <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{text}</p>;
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <PageHeader
        title="Smart Match de Vagas"
        subtitle="Cruze automaticamente os requisitos das vagas estruturadas com as habilidades dos candidatos."
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda: lista de vagas */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Vagas Abertas
            </h3>

            {jobs.length === 0 ? (
              <div className="p-8 rounded-xl border border-border/50 bg-card text-center">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">Nenhuma vaga cadastrada.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {jobs.map((job) => {
                  const isSelected = jobId === job.id;
                  return (
                    <motion.button
                      key={job.id}
                      onClick={() => handleSelectJob(job.id)}
                      whileHover={{ y: -1 }}
                      className={`w-full text-left block p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                          : "bg-card border-border/60 hover:bg-accent/40 hover:border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className={`font-semibold text-sm transition-colors ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}>
                          {job.title}
                        </h4>
                      </div>
                      
                      {/* Metadados rápidos do card */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-xs text-muted-foreground font-medium">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {job.location}
                          </span>
                        )}
                        {job.work_model && (
                          <span className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 text-[10px]">
                            {job.work_model}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills ? (
                          job.required_skills
                            .split(",")
                            .slice(0, 3)
                            .map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40"
                              >
                                {s.trim()}
                              </span>
                            ))
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground">Sem skills exigidas</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna direita: Painel de Match & Detalhes com Brilho High-Tech */}
          <div className="lg:col-span-2">
            {!selectedJob ? (
              <div className="bg-card border border-border/50 rounded-xl p-12 min-h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                {jobs.length === 0 ? (
                  <>
                    <Briefcase className="w-12 h-12 mb-4 opacity-20 text-muted-foreground" />
                    <p className="text-base font-semibold text-foreground">Nenhuma vaga cadastrada</p>
                    <p className="text-xs mt-1 text-center max-w-sm text-muted-foreground">
                      Crie uma vaga na página de <Link href="/jobs" className="text-primary hover:underline font-semibold">Gestão de Vagas</Link> para começar a usar o Smart Match.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-[0_0_20px_rgba(var(--primary),0.15)]">
                      <Target className="w-7 h-7 animate-pulse" />
                    </div>
                    <p className="text-base font-semibold text-foreground">Selecione uma vaga ao lado</p>
                    <p className="text-xs mt-1 text-center max-w-sm text-muted-foreground">
                      Selecione uma vaga para analisar a compatibilidade do banco de talentos com IA.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-card border border-primary/20 shadow-[0_0_25px_rgba(var(--primary),0.06)] rounded-xl p-6 min-h-[500px] flex flex-col transition-all duration-300">
                
                {/* Header do painel detalhado */}
                <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-border/40 pb-5 mb-5 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedJob.title}</h3>
                    
                    {/* Badges e Fatos Rápidos */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {selectedJob.location}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        {selectedJob.employment_type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        {selectedJob.work_model}
                      </span>
                      {selectedJob.deadline && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Calendar className="w-3.5 h-3.5" />
                          Prazo: {new Date(selectedJob.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações da Vaga */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <Link
                      href={`/jobs/${selectedJob.slug || selectedJob.id}`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-primary px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Gerenciar Vaga
                    </Link>
                  </div>
                </div>

                {/* Tabs de Seleção */}
                <div className="flex border-b border-border/40 mb-5">
                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer px-3 ${
                      activeTab === "matches"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      Smart Match ({selectedJob.required_skills ? selectedJob.required_skills.split(",").length : 0} Skills)
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer px-3 ${
                      activeTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      Descrição da Vaga
                    </span>
                  </button>
                </div>

                {/* Conteúdo das Tabs */}
                <div className="flex-1">
                  {activeTab === "matches" ? (
                    <div className="animate-in fade-in duration-200">
                      <JobMatchViewer />
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-200 text-foreground">
                      
                      {/* Sobre a Empresa */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sobre a Vaga / Resumo</h4>
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {selectedJob.description}
                        </p>
                      </div>

                      {/* Atividades */}
                      {selectedJob.responsibilities && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Principais Atividades</h4>
                          <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                            {renderTextOrList(selectedJob.responsibilities)}
                          </div>
                        </div>
                      )}

                      {/* Requisitos */}
                      {selectedJob.requirements && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requisitos e Qualificações</h4>
                          <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                            {renderTextOrList(selectedJob.requirements)}
                          </div>
                        </div>
                      )}

                      {/* Benefícios */}
                      {selectedJob.benefits && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">O que oferecemos</h4>
                          <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                            {renderTextOrList(selectedJob.benefits)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

