"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../providers/AuthProvider";
import { PrivateGate } from "../PrivateGate";
import { Search, Palette, Brain, Layers, Trash2 } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ExplorePage() {
  const auth = useAuth();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (auth.status !== "authed") return;

    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", auth.session.user.id)
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .abortSignal(ac.signal);

        if (!ac.signal.aborted) {
          setProjects(data ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [auth.status, supabase, auth.session?.user?.id]);

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setProjectToDelete(null);
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PrivateGate>
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Explora tus proyectos
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Organiza, crea y da vida a tus ideas
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyectos..."
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Cargando proyectos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                No tienes proyectos aún
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Crea tu primer proyecto para comenzar
              </p>
              <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Crear Primer Proyecto
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <div key={project.id} className="group bg-white dark:bg-neutral-800 p-6 rounded-lg border relative">
                  <Link href={`/${project.type}/${project.id}`} className="block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <Palette className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {projectToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Eliminar Proyecto</h3>
              <p className="mb-6">¿Estás seguro de eliminar "{projectToDelete.title}"?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(projectToDelete.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PrivateGate>
  );
}
