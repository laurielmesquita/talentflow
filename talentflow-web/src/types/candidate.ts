export interface Experience {
  company_name: string;
  job_title: string;
  description?: string | null;
  is_current?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

export interface Candidate {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  current_job?: string;
  categories: string[];
  skills: string[];
  experiences?: Experience[];
  added_at?: string | null;
  created_at?: string | null;
  pdf_url?: string | null;
  original_pdf_url?: string | null;
  photo_url?: string | null;
  quality_score?: number | null;
  quality_tier?: 'high' | 'medium' | 'low' | null;
  quality_alerts?: string[];
  version?: number;
  is_active?: boolean;
  is_flagged?: boolean;
  flagged_reason?: string | null;
  flagged_at?: string | null;
  summary?: string | null;
  parent_id?: string | null;
}

export interface CandidateStats {
  total: number;
  active: number;
  flagged: number;
  average_quality: number | null;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  stats: CandidateStats;
}
