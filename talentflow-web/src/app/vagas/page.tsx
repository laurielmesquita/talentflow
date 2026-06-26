import { Suspense } from "react";
import PublicJobsList from "@/components/PublicJobsList";
import LandingHeader from "@/components/LandingHeader";

// Revalidar a página a cada 60 segundos (Incremental Static Regeneration)
export const revalidate = 60;

async function getPublicJobs() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Chama o endpoint público, sem autenticação
    const res = await fetch(`${API_URL}/api/public/vagas`, {
      next: { revalidate: 60 } // ISR
    });
    
    if (!res.ok) {
      console.error("Failed to fetch public jobs:", res.status);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching public jobs:", error);
    return [];
  }
}

export const metadata = {
  title: "Vagas Abertas | TalentFlow",
  description: "Faça parte do nosso time de talentos. Encontre a oportunidade perfeita para o seu próximo grande passo profissional.",
};

export default async function PublicJobsPage() {
  const jobs = await getPublicJobs();

  return (
    <>
      <LandingHeader />
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Carregando oportunidades...</p>
        </div>
      }>
        <PublicJobsList initialJobs={jobs} />
      </Suspense>
    </>
  );
}
