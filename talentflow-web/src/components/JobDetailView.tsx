"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Trash2, Link2, MapPin, Briefcase, Calendar, Mail, Clock, 
  Users, Eye, CheckCircle, Sparkles, X, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JobFormDrawer from "@/components/JobFormDrawer";
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

export default function JobDetailView({ initialJob }: { initialJob: Job }) {
  const router = useRouter();
  const [job, setJob] = useState<Job>(initialJob);
  const [activeTab, setActiveTab] = useState<"details" | "applications">("details");

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenEditDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setConfirmDeleteText("");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setConfirmDeleteText("");
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteText !== "EXCLUIR") return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status}`);
      }

      showToast("Vaga excluída com sucesso!");
      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error("Erro ao deletar vaga:", error);
      showToast("Erro ao excluir a vaga.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const targetIdentifier = job.slug || job.id;
    const publicUrl = `${origin}/vagas/${targetIdentifier}`;
    
    navigator.clipboard.writeText(publicUrl);
    showToast("Link público copiado!");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleEditSuccess = async () => {
    // Recarrega os dados da vaga da API para atualizar o estado local
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedJob = await res.json();
        setJob(updatedJob);
      }
    } catch (error) {
      console.error("Erro ao recarregar dados da vaga:", error);
    }
    showToast("Vaga atualizada com sucesso!");
    router.refresh();
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

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const statusColor = job.is_active && !isExpired
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";

  const statusLabel = job.is_active && !isExpired ? "Ativa" : "Inativa/Encerrada";

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <PageHeader
        title={job.title}
        subtitle="Gerenciamento de detalhes, link público de candidatura e acompanhamento dos candidatos inscritos."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/jobs")}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              onClick={handleOpenEditDrawer}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Editar Vaga
            </button>
            <button
              onClick={handleOpenDeleteModal}
              className="flex items-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Tabs de Seleção */}
        <div className="flex border-b border-slate-200 dark:border-white/5 mb-8">
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
              Detalhes da Vaga
            </span>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer px-4 ${
              activeTab === "applications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Candidaturas Recebidas
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === "details" ? (
            <>
              {/* Coluna da Esquerda: Conteúdo Principal */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
                  {/* Sobre a Vaga */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Descrição / Resumo Geral</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Atividades */}
                  {job.responsibilities && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Principais Atividades</h4>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
                        {renderTextOrList(job.responsibilities)}
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  {job.requirements && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Requisitos e Qualificações</h4>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
                        {renderTextOrList(job.requirements)}
                      </div>
                    </div>
                  )}

                  {/* Benefícios */}
                  {job.benefits && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">O que oferecemos</h4>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/5">
                        {renderTextOrList(job.benefits)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna da Direita: Metadados & Link de Divulgação */}
              <div className="lg:col-span-1 space-y-6">
                {/* Painel de Metadados */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-white/5 pb-3">
                    Informações Rápidas
                  </h4>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Status</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Localização</span>
                      <span className="font-semibold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Modelo</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{job.work_model}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Contrato</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{job.employment_type}</span>
                    </div>

                    {job.deadline && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Prazo Limite</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(job.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link de Inscrição Pública */}
                <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 border border-primary/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Link2 className="w-5 h-5" />
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Divulgar Vaga</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Divulgue o link abaixo. Candidatos poderão enviar seus currículos em PDF diretamente por meio desta página, onde rodaremos o fluxo inteligente de extração de dados e validação.
                  </p>
                  
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:border-primary transition-all cursor-pointer font-medium"
                  >
                    <span className="truncate mr-2">
                      {window.location.origin}/vagas/{job.slug || job.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-primary flex-shrink-0 bg-primary/10 px-2 py-1 rounded">
                      Copiar
                    </span>
                  </button>

                  <a
                    href={`/vagas/${job.slug || job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl text-xs font-semibold border border-primary/10 transition-all cursor-pointer text-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visualizar Página Pública
                  </a>
                </div>


                {/* Skills Exigidas */}
                {job.required_skills && (
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Habilidades Exigidas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.split(",").map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-muted-foreground border border-slate-200 dark:border-white/10"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Tab Candidaturas (Integração Futura nos Steps 6 e 7) */
            <div className="col-span-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Users className="w-12 h-12 text-slate-400 mb-4 opacity-40" />
              <h4 className="text-lg font-bold text-foreground mb-1">Candidaturas para a vaga</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Assim que novos candidatos se inscreverem através do link público da vaga, eles aparecerão detalhados aqui com os seus scores e informações extraídas.
              </p>
            </div>
          )}
        </div>
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
            onSubmitSuccess={handleEditSuccess}
            jobToEdit={job}
          />
        )}
      </AnimatePresence>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {isDeleteModalOpen && (
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
                      Você está prestes a excluir permanentemente a vaga: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{job.title}</strong>.
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
