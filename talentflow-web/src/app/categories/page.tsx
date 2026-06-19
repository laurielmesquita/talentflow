import CategoriesDashboard from "@/components/CategoriesDashboard";
import { cookies } from 'next/headers';

interface Category {
  id: string;
  name: string;
}

async function getCategories(token?: string): Promise<Category[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/categories`, { 
      headers,
      cache: "no-store" 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const categories = await getCategories(token);

  return <CategoriesDashboard initialCategories={categories} />;
}

