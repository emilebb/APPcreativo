"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { projectService, type Project } from "@/lib/projectService";
import { ArrowLeft, Settings, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      // For now, we'll redirect based on project type
      // In the future, this could load project details
      const projects = await projectService.getProjects(session?.user?.id || '');
      const currentProject = projects.find(p => p.id === projectId);
      
      if (currentProject) {
        setProject(currentProject);
        // Redirect to appropriate editor based on project type
        switch (currentProject.type) {
          case 'moodboard':
            router.push(`/moodboard/${projectId}`);
            break;
          case 'mindmap':
            router.push(`/mindmap/${projectId}`);
            break;
          case 'canvas':
            router.push(`/canvas/${projectId}`);
            break;
          default:
            // Stay on this page for other types
            break;
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando proyecto...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Proyecto no encontrado
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            El proyecto que buscas no existe o no tienes permiso para verlo.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {project.title}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Tipo: {project.type} • ID: {project.id}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          Este es un proyecto de tipo <strong>{project.type}</strong>.
        </p>
        <p className="text-center text-neutral-600 dark:text-neutral-400 mt-2">
          Serás redirigido automáticamente al editor correspondiente.
        </p>
      </div>
    </main>
  );
}
