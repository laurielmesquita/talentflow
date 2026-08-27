"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";

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
    <div className="dashboard-atmosphere min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col">
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
           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Faça parte do nosso <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              time de talentos
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Estamos sempre em busca de pessoas incríveis. Encontre a oportunidade perfeita para o seu próximo grande passo profissional.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
             <div className="relative flex items-center glass-panel-strong rounded-2xl p-2 shadow-xl">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <Input
                type="text"
                placeholder="Busque por cargo, tecnologia ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-auto border-0 bg-transparent px-4 py-3 text-lg shadow-none focus-visible:border-0 focus-visible:ring-0"
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
               className="text-center py-20 glass-panel-strong border-border/70 rounded-3xl"
            >
              <Briefcase className="mx-auto mb-6 h-16 w-16 text-muted-foreground/40" />
              <h3 className="mb-2 text-2xl font-bold text-foreground">Nenhuma vaga encontrada</h3>
              <p className="text-muted-foreground">
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
                     <div className="group relative glass-panel glass-panel-interactive rounded-3xl p-6 md:p-8 overflow-hidden">
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                        <div className="flex-1">
                          <h2 className="mb-4 text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                            {job.title}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                              <Briefcase className="w-4 h-4" />
                              <span className="font-medium">{job.employment_type} &bull; {job.work_model}</span>
                            </div>
                            {job.created_at && (
                              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
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
