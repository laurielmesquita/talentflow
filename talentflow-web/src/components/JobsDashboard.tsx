"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, MapPin, Plus, Trash2, Edit, Target, 
  ArrowRight, Mail, Calendar, Clock, Sparkles, X, 
  AlertTriangle, CheckCircle, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JobFormDrawer from "./JobFormDrawer";
import JobMatchViewer from "./JobMatchViewer";
import { ThemeToggle } from "./ThemeToggle";

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

export default function JobsDashboard({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // URL Search Params sync
  const jobId = searchParams.get("jobId") || undefined;

  // Local State
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [activeTab, setActiveTab] = useState<"matches" | "details">("matches");
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  // Delete Modal States
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteJobTitle, setDeleteJobTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Sync props to state
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const selectedJob = jobs.find((j) => j.id === jobId);

  const handleSelectJob = (id: string) => {
    router.push(`${pathname}?jobId=${id}`, { scroll: false });
  };

  const handleOpenCreateDrawer = () => {
    setJobToEdit(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (job: Job) => {
    setJobToEdit(job);
    setIsDrawerOpen(true);
  };

  const handleOpenDeleteModal = (job: Job) => {
    setDeleteJobId(job.id);
    setDeleteJobTitle(job.title);
    setConfirmDeleteText("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteJobId(null);
    setDeleteJobTitle("");
    setConfirmDeleteText("");
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteText !== "EXCLUIR" || !deleteJobId) return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/jobs/${deleteJobId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status}`);
      }

      // Se deletou a vaga selecionada, limpa o query param
      if (jobId === deleteJobId) {
        router.push(pathname, { scroll: false });
      }

      handleCloseDeleteModal();
      router.refresh(); // Atualiza o Server Component
    } catch (error) {
      console.error("Erro ao deletar vaga:", error);
    } finally {
      setIsDeleting(false);
    }
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
              TF
            </div>
            <h1 className="text-xl font-semibold tracking-tight">TalentFlow</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/candidates" className="text-muted-foreground hover:text-foreground transition-colors">
              Candidatos
            </Link>
            <Link href="/jobs" className="text-primary">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Categorias
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleOpenCreateDrawer}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Vaga
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Smart Match de Vagas</h2>
            <p className="text-muted-foreground">
              Cruze automaticamente os requisitos das vagas estruturadas com as habilidades dos candidatos.
            </p>
          </div>
        </div>

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
                  Selecione ou crie uma vaga para analisar os currículos compatíveis do banco e ver a descrição estruturada.
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

                  {/* Ações da Vaga */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => handleOpenEditDrawer(selectedJob)}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(selectedJob)}
                      className="flex items-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
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

                      {/* Como se Candidatar */}
                      {(selectedJob.application_email || selectedJob.application_subject) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Como se Candidatar</h4>
                          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 space-y-2">
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold uppercase tracking-wider">Instruções de envio:</p>
                            <div className="space-y-1.5 text-sm">
                              {selectedJob.application_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-indigo-500" />
                                  <span>E-mail: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{selectedJob.application_email}</strong></span>
                                </div>
                              )}
                              {selectedJob.application_subject && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  <span>Assunto do e-mail: <strong className="text-slate-900 dark:text-slate-200 font-semibold">"{selectedJob.application_subject}"</strong></span>
                                </div>
                              )}
                            </div>
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

      {/* Drawer Formulário */}
      <AnimatePresence>
        {isDrawerOpen && (
          <JobFormDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSubmitSuccess={() => {
              router.refresh();
            }}
            jobToEdit={jobToEdit}
          />
        )}
      </AnimatePresence>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {deleteJobId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDeleteModal}
              className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-foreground overflow-hidden z-10"
            >
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Excluir Vaga</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você está prestes a excluir permanentemente a vaga: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{deleteJobTitle}</strong>.
                  </p>
                  <p className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 text-rose-500 dark:text-rose-400 text-xs">
                    ⚠️ <strong>Esta ação é irreversível.</strong> Todas as conexões de Match e registros internos dessa vaga serão removidos permanentemente.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Para confirmar, digite <span className="font-mono text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">EXCLUIR</span> no campo abaixo:
                    </p>
                    <input
                      type="text"
                      value={confirmDeleteText}
                      onChange={(e) => setConfirmDeleteText(e.target.value)}
                      placeholder="Digite EXCLUIR"
                      disabled={isDeleting}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-foreground disabled:opacity-50 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={confirmDeleteText !== "EXCLUIR" || isDeleting}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-rose-400/50 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
