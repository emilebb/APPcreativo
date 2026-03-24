"use client";

import { useState, useEffect } from "react";
import { Plus, Brain, Network, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { projectService } from "@/lib/projectService";

export default function MindMapsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mindMaps, setMindMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMindMaps();
  }, [user]);

  const loadMindMaps = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const projects = await projectService.getProjects(user.id, 50);
      const mindmapProjects = projects.filter(p => p.type === 'mindmap');
      setMindMaps(mindmapProjects);
    } catch (error) {
      console.error("Error loading mindmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      alert("Por favor inicia sesión para crear mapas mentales");
      return;
    }

    try {
      const newMindMap = await projectService.createProject(user.id, "mindmap");
      router.push(`/mindmap/${newMindMap.id}`);
    } catch (error) {
      console.error("Error creating mindmap:", error);
      alert("Error al crear el mapa mental");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <p className="text-neutral-400 text-sm">Cargando mapas mentales...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.02)_40%)] bg-[length:24px_24px]" />
      </div>

      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Mapas Mentales - Organiza Ideas y Conceptos Visualmente</h1>
      
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Mapas Mentales
              </h2>
            </div>
            <p className="text-sm text-neutral-400">
              {mindMaps.length} {mindMaps.length === 1 ? 'mapa mental' : 'mapas mentales'}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="group relative px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 opacity-100 group-hover:opacity-90 transition-opacity" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Nuevo Mapa Mental</span>
          </button>
        </div>

        {mindMaps.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto">
            {/* Decorative neon node connections */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-cyan-500/30 flex items-center justify-center">
                <Network className="w-8 h-8 text-cyan-400" />
              </div>
              {/* Connection nodes */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              No tienes mapas mentales aún
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Crea tu primer mapa mental para organizar y visualizar tus ideas con conexiones neuronales
            </p>
            <button
              onClick={handleCreateNew}
              className="group relative px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 opacity-100 group-hover:opacity-90 transition-opacity" />
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Crear Primer Mapa Mental</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mindMaps.map((mindMap, index) => (
              <Link
                key={mindMap.id}
                href={`/mindmap/${mindMap.id}`}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Mindmap preview with neon glow effect */}
                <div className="aspect-video bg-[#0a0a0a] rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120">
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    {/* Connecting lines */}
                    <path 
                      d="M100,60 L60,30" 
                      stroke={`url(#gradient-${index})`} 
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                    />
                    <path 
                      d="M100,60 L140,35" 
                      stroke={`url(#gradient-${index})`} 
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                    />
                    <path 
                      d="M100,60 L70,90" 
                      stroke={`url(#gradient-${index})`} 
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                    />
                    <path 
                      d="M100,60 L130,85" 
                      stroke={`url(#gradient-${index})`} 
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                    />
                    {/* Outer nodes */}
                    <circle cx="60" cy="30" r="4" fill="#22d3ee" className="shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                    <circle cx="140" cy="35" r="4" fill="#8b5cf6" className="shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                    <circle cx="70" cy="90" r="4" fill="#22d3ee" className="shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                    <circle cx="130" cy="85" r="4" fill="#8b5cf6" className="shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                  </svg>
                </div>
                
                <h3 className="font-semibold text-white mb-1 truncate group-hover:text-cyan-300 transition-colors">
                  {mindMap.title}
                </h3>
                <p className="text-xs text-neutral-500">
                  {new Date(mindMap.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan-500/20" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
