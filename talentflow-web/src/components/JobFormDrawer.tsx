"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/auth";
import Portal from "@/components/Portal";

interface Job {
  id?: string;
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
}

interface JobFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  jobToEdit?: Job | null;
}

export default function JobFormDrawer({
  isOpen,
  onClose,
  onSubmitSuccess,
  jobToEdit,
}: JobFormDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("CLT (Efetivo)");
  const [workModel, setWorkModel] = useState("Presencial");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [appEmail, setAppEmail] = useState("adm.the@outlook.com");
  const [appSubject, setAppSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Estado para Skills (Tags)
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Preenche o formulário se estiver em modo de edição
  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title || "");
      setLocation(jobToEdit.location || "");
      setEmploymentType(jobToEdit.employment_type || "CLT (Efetivo)");
      setWorkModel(jobToEdit.work_model || "Presencial");
      setDescription(jobToEdit.description || "");
      setResponsibilities(jobToEdit.responsibilities || "");
      setRequirements(jobToEdit.requirements || "");
      setBenefits(jobToEdit.benefits || "");
      setAppEmail(jobToEdit.application_email || "");
      setAppSubject(jobToEdit.application_subject || "");
      setDeadline(jobToEdit.deadline || "");
      
      const skillList = jobToEdit.required_skills
        ? jobToEdit.required_skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      setSkills(skillList);
    } else {
      // Resetar para criação
      setTitle("");
      setLocation("");
      setEmploymentType("CLT (Efetivo)");
      setWorkModel("Presencial");
      setDescription("");
      setResponsibilities("");
      setRequirements("");
      setBenefits("");
      setAppEmail("adm.the@outlook.com");
      setAppSubject("");
      setDeadline("");
      setSkills([]);
    }
    setError(null);
  }, [jobToEdit, isOpen]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(/,$/, "");
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Título e Descrição Geral são obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      location: location.trim() || "A combinar",
      employment_type: employmentType,
      work_model: workModel,
      responsibilities: responsibilities.trim() || null,
      requirements: requirements.trim() || null,
      benefits: benefits.trim() || null,
      application_email: appEmail.trim() || null,
      application_subject: appSubject.trim() || null,
      deadline: deadline || null,
      required_skills: skills.join(", "),
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = jobToEdit
        ? `${API_URL}/api/jobs/${jobToEdit.id}`
        : `${API_URL}/api/jobs`;
      
      const method = jobToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status}`);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar a vaga. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-2xl h-full bg-card dark:bg-slate-900 border-l border-border dark:border-white/10 shadow-2xl flex flex-col z-10 text-foreground overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border dark:border-white/10 flex items-center justify-between bg-card/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {jobToEdit ? "Editar Vaga" : "Nova Vaga"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {jobToEdit ? "Atualize os metadados da vaga no banco" : "Preencha as informações da nova oportunidade"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground border border-border dark:border-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Scroll Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-card dark:bg-slate-900">
          {error && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Informações Gerais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary border-b border-border dark:border-white/5 pb-2">
              1. Informações Básicas
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Título da Vaga *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Técnico em Eletrônica / Manutenção de Placas"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Teresina - PI"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Regime de Contratação</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="CLT (Efetivo)">CLT (Efetivo)</option>
                  <option value="PJ">PJ</option>
                  <option value="Estágio">Estágio</option>
                  <option value="Temporário">Temporário</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Modelo de Trabalho</label>
                <select
                  value={workModel}
                  onChange={(e) => setWorkModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Detalhamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary border-b border-border dark:border-white/5 pb-2">
              2. Detalhamento e Escopo
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Sobre a Empresa / Resumo Geral *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fale brevemente sobre a cultura da empresa e o propósito geral do cargo..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Principais Atividades (Markdown)</label>
              <textarea
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="• Realizar diagnóstico preciso e manutenção em smartphones...&#10;• Executar reparos em placas-mãe..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Requisitos e Qualificações (Markdown)</label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="• Curso Técnico em Eletrônica...&#10;• Conhecimento prático em soldas e microeletrônica..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Benefícios / O que oferecemos (Markdown)</label>
              <textarea
                rows={3}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="• Salário fixo CLT compatível com o mercado&#10;• Vale-Alimentação&#10;• Plano de Incentivos..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Section 3: Matching Config (Skills) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary border-b border-border dark:border-white/5 pb-2">
              3. Configuração de Inteligência (Smart Match)
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Habilidades Obrigatórias (Skills)</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg space-y-3">
                {/* Tag Container */}
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="hover:bg-primary/20 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Digite uma habilidade e aperte Enter ou vírgula.</p>
                )}
                
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Adicionar skill (ex: Solda, Eletrônica)"
                  className="w-full bg-transparent border-t border-border dark:border-white/5 pt-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Candidatura */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary border-b border-border dark:border-white/5 pb-2">
              4. Como se Candidatar & Prazos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">E-mail para Candidatura</label>
                <input
                  type="email"
                  value={appEmail}
                  onChange={(e) => setAppEmail(e.target.value)}
                  placeholder="Ex: adm.the@outlook.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assunto do E-mail</label>
                <input
                  type="text"
                  value={appSubject}
                  onChange={(e) => setAppSubject(e.target.value)}
                  placeholder="Ex: Técnico de Manutenção - Teresina"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Prazo Limite para Envio</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border dark:border-white/10 flex items-center justify-end gap-3 bg-card/90 dark:bg-slate-900/90 backdrop-blur sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground border border-border dark:border-white/5 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold text-sm px-6 py-2 rounded-lg transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{jobToEdit ? "Salvar Alterações" : "Criar Vaga"}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
    </Portal>
  );
}
