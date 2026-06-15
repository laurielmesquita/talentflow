"use client";

import { useState } from "react";
import CandidateModal from "./CandidateModal";

export default function CandidateTable({
  candidates,
  initialCandidateId,
}: {
  candidates: any[];
  initialCandidateId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialCandidateId ?? null);

  return (
    <>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Candidato</th>
              <th className="px-6 py-4">Cargo Atual / Último</th>
              <th className="px-6 py-4">Skills Identificadas</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum candidato encontrado.</td>
              </tr>
            ) : (
              candidates.map((cand: any) => (
                <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                        {cand.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{cand.full_name}</div>
                        <div className="text-xs text-slate-500">{cand.categories[0] || 'Geral'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{cand.current_job || 'Não informado'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {cand.skills.slice(0, 3).map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedId(cand.id)} 
                      className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Ver Perfil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <CandidateModal candidateId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
