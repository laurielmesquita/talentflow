import { Suspense } from "react";
import PublicJobsList from "@/components/PublicJobsList";
import LandingHeader from "@/components/LandingHeader";

// A lista pública depende da API em runtime; o build não deve depender de uma API local.
export const dynamic = "force-dynamic";

async function getPublicJobs() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Chama o endpoint público, sem autenticação
    const res = await fetch(`${API_URL}/api/public/vagas`, { cache: "no-store" });
    
    if (!res.ok) {
      return [];
    }
    
    return res.json();
  } catch {
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-muted-foreground">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
          </div>
          <p className="mt-4 animate-pulse font-medium">Carregando oportunidades...</p>
        </div>
      }>
        <PublicJobsList initialJobs={jobs} />
      </Suspense>
    </>
  );
}
