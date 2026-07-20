import type { Metadata } from "next";
import { Suspense } from "react";
import SmartMatchDashboard from "@/components/SmartMatchDashboard";

export const metadata: Metadata = {
  title: 'Smart Match',
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

export default async function SmartMatchPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jobs = await getJobs(token);
  
  return (
    <Suspense fallback={
      <div className="flex-1 bg-background text-foreground font-sans">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40 animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-3 animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-12 min-h-[500px] flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-72" />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SmartMatchDashboard initialJobs={jobs} />
    </Suspense>
  );
}
