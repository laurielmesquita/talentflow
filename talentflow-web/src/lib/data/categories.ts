import { redirect } from 'next/navigation';
import type { Category } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCategories(token?: string): Promise<Category[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/categories`, { 
      headers,
      cache: 'no-store' 
    });
    if (res.status === 401) {
      redirect('/login');
    }
    if (!res.ok) return [];
    return res.json();
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return [];
  }
}
