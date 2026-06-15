"use client";

import { useState, useEffect } from "react";
import { Briefcase, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function JobsClient({ initialJobs, initialJobId }: { initialJobs: any[], initialJobId?: string }) {
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(initialJobId);
  const [selectedJobMatches, setSelectedJobMatches] = useState<any[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialJobId && !selectedJobId) {
       setSelectedJobId(initialJobId);
    }
  }, [initialJobId, selectedJobId]);

  useEffect(() => {
    async function fetchMatches() {
      if (!selectedJobId) {
        setSelectedJobMatches([]);
        setSelectedJobTitle("");
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/jobs/${selectedJobId}/match`);
        if (res.ok) {
          const matchData = await res.json();
          setSelectedJobMatches(matchData.matches || []);
          setSelectedJobTitle(matchData.job_title || "");
        }
      } catch (error) {
        console.error("Erro ao buscar compatibilidade da vaga:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, [selectedJobId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna da Esquerda: Lista de Vagas */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" /> Vagas Abertas
        </h3>
        {initialJobs.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma vaga cadastrada.</p>
        ) : (
          initialJobs.map((job: any) => (
            <button 
              key={job.id} 
              onClick={() => setSelectedJobId(job.id)}
              className={`w-full text-left block p-5 rounded-xl border transition-all ${selectedJobId === job.id ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-900/10' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-semibold ${selectedJobId === job.id ? 'text-indigo-300' : 'text-slate-200'}`}>{job.title}</h4>
                {selectedJobId === job.id && <Target className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-1">
                {job.required_skills.split(",").slice(0, 3).map((s: string, idx: number) => (
                  <span key={idx} className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">{s.trim()}</span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Coluna da Direita: Match Ranking */}
      <div className="lg:col-span-2">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 min-h-[500px]">
          {!selectedJobId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
              <Target className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-400">Selecione uma vaga ao lado</p>
              <p className="text-sm">O motor de inteligência irá cruzar os perfis automaticamente.</p>
            </div>
          ) : loading ? (
             <div className="h-full flex flex-col items-center justify-center text-indigo-400 py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400 mb-4"></div>
               <p className="text-sm">Calculando compatibilidade via IA...</p>
             </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedJobTitle}</h3>
                  <p className="text-sm text-indigo-400 font-medium mt-1">Ranking de Compatibilidade</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedJobMatches.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum candidato no banco possui as skills exigidas.</p>
                ) : (
                  selectedJobMatches.map((cand: any, idx: number) => (
                    <div key={cand.candidate_id} className="flex items-center justify-between p-4 rounded-lg border border-slate-800/50 bg-slate-900/80 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold border border-slate-700">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{cand.full_name}</p>
                          <div className="flex gap-2 mt-1">
                            {cand.matched_skills.map((s: string, i: number) => (
                              <span key={i} className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">{cand.match_score}%</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Match Score</div>
                        </div>
                        <Link href={`/?candidateId=${cand.candidate_id}`} className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
