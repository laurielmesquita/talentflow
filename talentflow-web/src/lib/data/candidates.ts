import { redirect } from 'next/navigation';
import type { CandidatesResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCandidates(
  category?: string, 
  q?: string, 
  page: number = 1, 
  limit: number = 10, 
  token?: string
): Promise<CandidatesResponse> {
  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    params.set('page', String(page));
    params.set('limit', String(limit));
    
    const url = `${API_URL}/api/candidates?${params.toString()}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { 
      headers,
      cache: 'no-store' 
    });
    if (res.status === 401) {
      redirect('/login');
    }
    if (!res.ok) {
      return { 
        candidates: [], 
        total: 0, 
        page, 
        limit, 
        stats: { total: 0, active: 0, flagged: 0, average_quality: null } 
      };
    }
    return res.json();
  } catch (error: unknown) {
    if ((error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return { 
      candidates: [], 
      total: 0, 
      page, 
      limit, 
      stats: { total: 0, active: 0, flagged: 0, average_quality: null } 
    };
  }
}
