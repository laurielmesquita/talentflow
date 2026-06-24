"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Briefcase, Clock, Building, Share2, Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import JobApplicationForm from "@/components/JobApplicationForm";

interface PublicJobDetailProps {
  job: {
    id: string;
    slug: string;
    title: string;
    description: string;
    location: string;
    employment_type: string;
    work_model: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    deadline?: string;
    required_skills: string;
    created_at: string;
  };
}

export default function PublicJobDetail({ job }: PublicJobDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
      
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            href="/vagas" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Todas as vagas
          </Link>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? "Link Copiado!" : "Compartilhar"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Job Info */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              Vaga Aberta
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="font-medium">{job.employment_type}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Building className="w-5 h-5 text-primary" />
                <span className="font-medium">{job.work_model}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Publicada {formatDistanceToNow(new Date(job.created_at), { locale: ptBR, addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Sobre a Vaga
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>

              {job.responsibilities && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Suas Responsabilidades
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </section>
              )}

              {job.requirements && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Requisitos e Qualificações
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </section>
              )}

              {job.benefits && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Benefícios
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Gostou da oportunidade?
                </h3>
                
                {isExpired ? (
                  <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-center font-medium">
                    As inscrições para esta vaga já foram encerradas.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      Não perca tempo e envie seu currículo. Nosso time analisará seu perfil!
                    </p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 cursor-pointer"
                    >
                      <Send className="w-5 h-5" />
                      Candidatar-se Agora
                    </button>
                    {job.deadline && (
                      <p className="text-xs text-center text-slate-500 mt-4">
                        Inscrições até: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(job.deadline).toLocaleDateString("pt-BR")}</span>
                      </p>
                    )}
                  </>
                )}

                {job.required_skills && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">
                      Habilidades Desejadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.split(",").map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Application Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <JobApplicationForm
            jobSlug={job.slug}
            jobTitle={job.title}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
