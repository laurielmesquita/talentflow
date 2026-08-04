import { Suspense } from "react";
import { Metadata } from "next";
import CandidateAuditWorkspace from "@/components/CandidateAuditWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Workspace de Auditoria Side-by-Side | TalentFlow",
  description: "Comparativo em tela cheia do PDF original enviado pelo candidato versus análise de inteligência da IA.",
};

export default async function CandidateAuditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-950 text-slate-100">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium animate-pulse">Inicializando Workspace de Auditoria...</p>
      </div>
    }>
      <CandidateAuditWorkspace candidateId={id} />
    </Suspense>
  );
}
