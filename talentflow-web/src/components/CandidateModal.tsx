"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone } from "lucide-react";

export default function CandidateModal({ candidateId, onClose }: { candidateId: string, onClose: () => void }) {
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`http://localhost:8000/api/candidates/${candidateId}`);
        if (res.ok) {
          setCandidate(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [candidateId]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 p-6 flex justify-between items-center z-10">
          <h3 className="font-semibold text-lg text-slate-200">Perfil do Candidato</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20 text-indigo-400">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400"></div>
            </div>
          ) : candidate ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 uppercase shrink-0">
                  {candidate.full_name.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{candidate.full_name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {candidate.categories.map((c: string) => (
                       <span key={c} className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {candidate.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" /> {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" /> {candidate.phone}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Experiência</h4>
                <div className="space-y-4">
                  {candidate.experiences.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Nenhuma experiência extraída.</p>
                  ) : (
                    candidate.experiences.map((exp: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                        <div className="font-semibold text-slate-200 mb-1">{exp.title}</div>
                        <div className="text-sm text-indigo-400 font-medium mb-2">{exp.company}</div>
                        {exp.desc && <p className="text-sm text-slate-400 leading-relaxed">{exp.desc}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-red-400">Erro ao carregar perfil.</div>
          )}
        </div>
      </div>
    </div>
  );
}
