import { Suspense } from "react";
import SmartMatchDashboard from "@/components/SmartMatchDashboard";
import { cookies } from 'next/headers';

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
}

async function getJobs(token?: string): Promise<Job[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/jobs`, { 
      headers,
      cache: "no-store" 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SmartMatchPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jobs = await getJobs(token);
  
  return (
    <Suspense fallback={
      <div className="flex-1 bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SmartMatchDashboard initialJobs={jobs} />
    </Suspense>
  );
}
