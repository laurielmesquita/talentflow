import { Suspense } from "react";
import JobDetailView from "@/components/JobDetailView";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  work_model: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  application_email: string;
  application_subject: string;
  deadline: string;
  required_skills: string;
  is_active: boolean;
  created_at: string;
  slug?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getJobDetail(id: string, token?: string): Promise<Job | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/jobs/${id}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Erro ao buscar detalhes da vaga:", error);
    return null;
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const job = await getJobDetail(id, token);

  if (!job) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-background text-foreground flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <JobDetailView initialJob={job} />
    </Suspense>
  );
}
