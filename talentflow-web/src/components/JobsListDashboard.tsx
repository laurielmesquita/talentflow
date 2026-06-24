"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Search, Sparkles, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "./JobCard";
import JobFormDrawer from "./JobFormDrawer";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Portal from "@/components/Portal";
import { getAuthHeaders } from "@/lib/auth";

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
  slug?: string;
}

export default function JobsListDashboard({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  
  // State
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  // Delete Modal States
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteJobTitle, setDeleteJobTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

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
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status}`);
      }

      showToast("Vaga excluída com sucesso.");
      handleCloseDeleteModal();
      router.refresh();
    } catch (error) {
      console.error("Erro ao deletar vaga:", error);
      showToast("Erro ao excluir vaga.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (job: Job) => {
    const origin = window.location.origin;
    // Quando implementarmos o slug, priorizaremos job.slug, senão usamos job.id
    const targetIdentifier = job.slug || job.id;
    const publicUrl = `${origin}/vagas/${targetIdentifier}`;
    
    navigator.clipboard.writeText(publicUrl);
    showToast("Link público copiado para a área de transferência!");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filtragem
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.required_skills && job.required_skills.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
    const isActive = job.is_active && !isExpired;

    if (statusFilter === "active") return matchesSearch && isActive;
    if (statusFilter === "inactive") return matchesSearch && !isActive;
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <PageHeader
        title="Gestão de Vagas"
        subtitle="Publique e gerencie vagas para divulgar externamente e coletar inscrições de candidatos."
        actions={
          <button
            onClick={handleOpenCreateDrawer}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Buscar por título, local ou habilidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 md:flex-none text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                statusFilter === "all"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`flex-1 md:flex-none text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                statusFilter === "active"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`flex-1 md:flex-none text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                statusFilter === "inactive"
                  ? "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              Inativas
            </button>
          </div>
        </div>

        {/* Grid de Vagas */}
        {filteredJobs.length === 0 ? (
          <div className="border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-bold text-foreground mb-1">Nenhuma vaga encontrada</h4>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Experimente ajustar os filtros ou crie uma nova vaga para começar a publicar no portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleOpenEditDrawer}
                onDelete={handleOpenDeleteModal}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-xl z-[150] text-sm font-semibold flex items-center gap-2 border border-slate-800 dark:border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Formulário */}
      <AnimatePresence>
        {isDrawerOpen && (
          <JobFormDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSubmitSuccess={() => {
              showToast(jobToEdit ? "Vaga editada com sucesso!" : "Vaga criada com sucesso!");
              router.refresh();
            }}
            jobToEdit={jobToEdit}
          />
        )}
      </AnimatePresence>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {deleteJobId && (
          <Portal lockScroll>
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
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
