import CategoriesDashboard from "@/components/CategoriesDashboard";

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoriesDashboard initialCategories={categories} />;
}

