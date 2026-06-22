"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tag, Plus, Trash2, Edit, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getSession, getAuthHeaders } from "@/lib/auth";
import Portal from "@/components/Portal";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesDashboard({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  
  // Local State
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states for Delete
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteCatName, setDeleteCatName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setUserRole(session.role);
  }, []);

  // Sync props to state
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCategoryToEdit(null);
    setNameInput("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    e.stopPropagation();
    setModalMode("edit");
    setCategoryToEdit(cat);
    setNameInput(cat.name);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteCatId(cat.id);
    setDeleteCatName(cat.name);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
    setNameInput("");
    setErrorMsg("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteCatId(null);
    setDeleteCatName("");
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setErrorMsg("O nome da categoria é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = modalMode === "create" 
        ? `${API_URL}/api/categories` 
        : `${API_URL}/api/categories/${categoryToEdit?.id}`;
      
      const method = modalMode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name: cleanName })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao salvar categoria");
      }

      handleCloseModal();
      router.refresh(); // refresh Server Component props
    } catch (error: any) {
      setErrorMsg(error.message || "Erro de conexão com a API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/categories/${deleteCatId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status}`);
      }

      handleCloseDeleteModal();
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </Navbar>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestão de Categorias</h2>
            <p className="text-muted-foreground">Estruture o seu banco de talentos por áreas de atuação.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-center max-w-md mx-auto mt-12">
            <Tag className="w-10 h-10 text-slate-400 mx-auto mb-4 opacity-55 animate-pulse" />
            <p className="text-base font-semibold text-foreground mb-1">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-muted-foreground mb-6">Crie a sua primeira categoria para organizar os currículos recebidos.</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-6 transition-all group relative hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5 shadow-sm hover:shadow-md overflow-hidden"
              >
                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenEditModal(e, cat)}
                    title="Editar categoria"
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteModal(e, cat)}
                    title="Excluir categoria"
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link href={`/?category=${encodeURIComponent(cat.name)}`} className="block cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <Tag className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors group-hover:text-primary dark:group-hover:text-primary pr-16 truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors mt-4 font-medium flex items-center gap-1">
                    Ver candidatos <Tag className="w-3 h-3" />
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <Portal lockScroll>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-foreground overflow-hidden z-10"
            >
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    {modalMode === "create" ? "Nova Categoria" : "Editar Categoria"}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label htmlFor="cat-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome da Categoria
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ex: Front-end, Comercial, Design..."
                    disabled={isSubmitting}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 font-semibold bg-rose-500/5 border border-rose-500/10 rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-foreground disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-primary/10 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Modal Confirmação de Exclusão */}
      <AnimatePresence>
        {deleteCatId && (
          <Portal lockScroll>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDeleteModal}
              className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-foreground overflow-hidden z-10"
            >
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Excluir Categoria</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você tem certeza que deseja excluir a categoria <strong className="text-slate-900 dark:text-slate-200 font-semibold">{deleteCatName}</strong>?
                  </p>
                  <p className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 text-rose-500 dark:text-rose-400 text-xs">
                    ⚠️ <strong>Atenção:</strong> Candidatos associados a esta categoria continuarão cadastrados no sistema, mas perderão este vínculo de filtro. Esta ação é definitiva.
                  </p>
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-foreground disabled:opacity-50 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-rose-400/50 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
