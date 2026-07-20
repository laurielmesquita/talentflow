import type { Metadata } from "next";
import { Suspense } from "react";
import JobsListDashboard from "@/components/JobsListDashboard";

export const metadata: Metadata = {
  title: 'Vagas',
};
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

export default async function JobsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jobs = await getJobs(token);
  
  return (
    <Suspense fallback={
      <div className="flex-1 bg-background text-foreground font-sans">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-4 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <JobsListDashboard initialJobs={jobs} />
    </Suspense>
  );
}
