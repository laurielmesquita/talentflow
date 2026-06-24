"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, MapPin, Target, Calendar, Settings
} from "lucide-react";
import JobMatchViewer from "./JobMatchViewer";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

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
      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {lines.map((line, idx) => {
          const cleaned = line.replace(/^[•\-\*\s]+/, "").trim();
          if (!cleaned) return null;
          return <li key={idx} className="leading-relaxed">{cleaned}</li>;
        })}
      </ul>
    );
  }

  function renderTextOrList(text?: string) {
    if (!text) return <p className="text-slate-500 italic text-sm">Não informado.</p>;
    if (text.includes("•") || text.includes("\n-") || text.includes("\n*") || text.split("\n").length > 2) {
      return formatListText(text);
    }
    return <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{text}</p>;
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

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
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Vagas Abertas
            </h3>

            {jobs.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-center">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-55" />
                <p className="text-sm text-muted-foreground">Nenhuma vaga cadastrada.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job.id)}
                    className={`w-full text-left block p-5 rounded-xl border transition-all cursor-pointer ${
                      jobId === job.id
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold transition-colors ${
                        jobId === job.id ? "text-primary" : "text-foreground"
                      }`}>
                        {job.title}
                      </h4>
                    </div>
                    
                    {/* Metadados rápidos do card */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs text-muted-foreground font-medium">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.location}
                        </span>
                      )}
                      {job.work_model && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          {job.work_model}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills ? (
                        job.required_skills
                          .split(",")
                          .slice(0, 3)
                          .map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-muted-foreground border border-slate-200 dark:border-white/10"
                            >
                              {s.trim()}
                            </span>
                          ))
                      ) : (
                        <span className="text-[10px] italic text-slate-500">Sem skills exigidas</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna direita: Painel de Match & Detalhes */}
          <div className="lg:col-span-2">
            {!selectedJob ? (
              <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-12 min-h-[500px] flex flex-col items-center justify-center text-slate-500">
                <Target className="w-12 h-12 mb-4 opacity-20 text-primary animate-pulse" />
                <p className="text-lg font-medium text-slate-400">Selecione uma vaga ao lado</p>
                <p className="text-sm mt-1 text-center max-w-sm">
                  Selecione uma vaga para analisar os candidatos compatíveis do banco e ver a descrição estruturada.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6 min-h-[500px] flex flex-col">
                
                {/* Header do painel detalhado */}
                <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-white/5 pb-6 mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedJob.title}</h3>
                    
                    {/* Badges e Fatos Rápidos */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {selectedJob.location}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-xs border border-indigo-500/10">
                        {selectedJob.employment_type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-500/10">
                        {selectedJob.work_model}
                      </span>
                      {selectedJob.deadline && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                          <Calendar className="w-3.5 h-3.5" />
                          Prazo: {new Date(selectedJob.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações da Vaga (Redirecionamento para Gestão) */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <Link
                      href={`/jobs/${selectedJob.id}`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Gerenciar Vaga
                    </Link>
                  </div>
                </div>

                {/* Tabs de Seleção */}
                <div className="flex border-b border-slate-200 dark:border-white/5 mb-6">
                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer px-4 ${
                      activeTab === "matches"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Smart Match ({selectedJob.required_skills ? selectedJob.required_skills.split(",").length : 0} Skills)
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer px-4 ${
                      activeTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
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
                    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800 dark:text-slate-200">
                      
                      {/* Sobre a Empresa */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Sobre a Empresa / Resumo</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {selectedJob.description}
                        </p>
                      </div>

                      {/* Atividades */}
                      {selectedJob.responsibilities && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Principais Atividades</h4>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
                            {renderTextOrList(selectedJob.responsibilities)}
                          </div>
                        </div>
                      )}

                      {/* Requisitos */}
                      {selectedJob.requirements && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Requisitos e Qualificações</h4>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
                            {renderTextOrList(selectedJob.requirements)}
                          </div>
                        </div>
                      )}

                      {/* Benefícios */}
                      {selectedJob.benefits && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">O que oferecemos</h4>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
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
