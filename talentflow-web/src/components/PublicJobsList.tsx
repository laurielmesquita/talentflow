"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PublicJob {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  work_model: string;
  created_at: string;
  required_skills: string;
}

export default function PublicJobsList({ initialJobs }: { initialJobs: PublicJob[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = initialJobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term) ||
      (job.required_skills && job.required_skills.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>Vagas Abertas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Faça parte do nosso <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              time de talentos
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Estamos sempre em busca de pessoas incríveis. Encontre a oportunidade perfeita para o seu próximo grande passo profissional.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <input
                type="text"
                placeholder="Busque por cargo, tecnologia ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3 focus:outline-none focus:ring-0 text-lg"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Jobs Grid */}
      <section className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 z-10">
        <AnimatePresence mode="popLayout">
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl"
            >
              <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Não encontramos nenhuma vaga correspondente à sua busca. Tente outros termos.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/vagas/${job.slug}`}>
                    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">
                            {job.title}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                              <Briefcase className="w-4 h-4" />
                              <span className="font-medium">{job.employment_type} &bull; {job.work_model}</span>
                            </div>
                            {job.created_at && (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  {formatDistanceToNow(new Date(job.created_at), { locale: ptBR, addSuffix: true })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-primary transition-all duration-300">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
