import DashboardClient from '@/components/DashboardClient';
import { cookies } from 'next/headers';

interface CandidateStats {
  total: number;
  added_today: number;
  average_quality: number;
  flagged_count: number;
}

interface JobStats {
  total: number;
  active: number;
  upcoming_deadlines: number;
}

interface CategoryStats {
  total: number;
  uncategorized: number;
  top_category: {
    name: string;
    count: number;
  };
}

interface RecentCandidate {
  id: string;
  full_name: string;
  current_job: string;
  quality_score: number | null;
  photo_url: string | null;
  created_at: string | null;
}

interface DashboardStats {
  candidates: CandidateStats;
  jobs: JobStats;
  categories: CategoryStats;
  recent_candidates: RecentCandidate[];
}

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

async function getStats(token?: string): Promise<DashboardStats> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_URL}/api/dashboard/stats`, { 
      headers,
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      candidates: { total: 0, added_today: 0, average_quality: 0, flagged_count: 0 },
      jobs: { total: 0, active: 0, upcoming_deadlines: 0 },
      categories: { total: 0, uncategorized: 0, top_category: { name: "Nenhuma", count: 0 } },
      recent_candidates: []
    };
  }
}

async function getJobs(token?: string): Promise<Job[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_URL}/api/jobs`, { 
      headers,
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  } catch (error) {
    console.error("Error fetching jobs for matching:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const [stats, jobs] = await Promise.all([
    getStats(token), 
    getJobs(token)
  ]);
  
  return (
    <DashboardClient initialStats={stats} initialJobs={jobs} />
  );
}
