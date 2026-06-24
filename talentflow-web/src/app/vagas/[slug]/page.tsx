import { Suspense } from "react";
import { notFound } from "next/navigation";
import PublicJobDetail from "@/components/PublicJobDetail";
import { Metadata } from "next";

// Revalidar a página a cada 60 segundos (ISR)
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPublicJob(slug: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/public/vagas/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch public job detail:", res.status);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching public job detail:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJob(slug);

  if (!job) {
    return {
      title: "Vaga não encontrada | TalentFlow",
    };
  }

  return {
    title: `${job.title} | TalentFlow`,
    description: `Vaga para ${job.title} em ${job.location}. Modelo: ${job.work_model}. Venha fazer parte do nosso time!`,
    openGraph: {
      title: `${job.title} - TalentFlow`,
      description: job.description.substring(0, 150) + "...",
      type: "website",
    },
  };
}

export default async function PublicJobPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublicJob(slug);

  if (!job) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Carregando detalhes da vaga...</p>
      </div>
    }>
      <PublicJobDetail job={job} />
    </Suspense>
  );
}
