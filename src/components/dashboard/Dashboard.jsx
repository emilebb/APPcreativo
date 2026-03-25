"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Palette, Brain, Layout, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar proyectos desde Supabase con limpieza
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Usar el nuevo servicio seguro
        const { default: projectsSecure } = await import("@/lib/projectsSecure");
        const { data, error } = await projectsSecure.getSecureProjects(user.id);

        if (error) throw error;
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (error) {
        console.error('Error loading projects:', error);
        // En caso de error, mostrar array vacío para evitar "fantasmas"
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadProjects();
    }
  }, [user?.id]);

  // Filtrar proyectos (búsqueda sobre copia del estado)
  useEffect(() => {
    const filtered = projects.filter(project =>
      project.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  // Eliminar proyecto con UI instantánea
  const handleDeleteProject = useCallback(async (projectId) => {
    if (isDeleting) return;

    setIsDeleting(true);
    const originalProjects = [...projects];
    const originalFiltered = [...filteredProjects];

    try {
      // 1. Actualizar UI inmediatamente (filter antes de cualquier await)
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
      setProjectToDelete(null);

      // 2. Eliminar en Supabase
      const { error } = await supabase
        .from('proyectos')
        .update({ estado: 'deleted' })
        .eq('id', projectId);

      if (error) throw error;

      console.log('Project deleted successfully');

    } catch (error) {
      console.error('Error deleting project:', error);
      
      // 3. Rollback si hay error
      setProjects(originalProjects);
      setFilteredProjects(originalFiltered);
      
      // Mostrar notificación de error
      alert('Error al eliminar el proyecto. Intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  }, [projects, filteredProjects, isDeleting, supabase]);

  // Crear nuevo proyecto con Optimistic UI
  const handleCreateProject = useCallback(async (type) => {
    try {
      // 1. Validación previa: ¿Hay usuario?
      if (!user?.id) throw new Error("Sesión no encontrada");

      // 2. Crear proyecto optimista con ID temporal
      const tempId = `tmp_${Date.now()}`;
      const optimisticProject = {
        id: tempId,
        nombre: `Nuevo ${type}`,
        tipo: type,
        user_id: user.id,
        estado: 'active',
        descripcion: '',
        data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true // 🔥 NUEVO: Marcar como temporal
      };

      // 3. Añadir optimistamente a la UI
      setProjects(prev => [optimisticProject, ...prev]);
      setFilteredProjects(prev => [optimisticProject, ...prev]);

      // 4. Usar el servicio seguro para crear en Supabase
      const { default: projectsSecure } = await import("@/lib/projectsSecure");
      const { data, error } = await projectsSecure.createSecureProject(
        user.id, 
        `Nuevo ${type}`, 
        type
      );

      if (error) throw error;

      // 5. Reemplazar temporal con el real
      if (data?.id) {
        setProjects(prev => prev.map(p => 
          p.id === tempId ? { ...data, isOptimistic: false } : p
        ));
        setFilteredProjects(prev => prev.map(p => 
          p.id === tempId ? { ...data, isOptimistic: false } : p
        ));

        // 6. NAVEGACIÓN SEGURA: Solo si 'data' existe y tiene ID
        window.location.href = `/${type}/${data.id}`;
      } else {
        throw new Error("No se pudo obtener el ID del proyecto creado");
      }

    } catch (error) {
      console.error('Error creating project:', error);
      
      // 7. Rollback: Eliminar proyectos optimistas
      setProjects(prev => prev.filter(p => !p.isOptimistic));
      setFilteredProjects(prev => prev.filter(p => !p.isOptimistic));
      
      // 8. Error handling con mensaje específico
      const errorMessage = error.message.includes("Sesión no encontrada") 
        ? "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        : error.message.includes("duplicate key") 
        ? "Ya existe un proyecto con ese nombre."
        : "No pudimos conectar con el servidor. Reintenta en un momento.";
      
      alert(errorMessage);
      
      // 9. Si es error de sesión, redirigir al login
      if (error.message.includes("Sesión no encontrada")) {
        window.location.href = '/login';
      }
    }
  }, [user?.id]);

  // Obtener icono según tipo
  const getProjectIcon = (type) => {
    switch (type) {
      case 'moodboard':
        return <Palette className="w-5 h-5" />;
      case 'mindmap':
        return <Brain className="w-5 h-5" />;
      case 'canvas':
        return <Layout className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Obtener color según tipo
  const getProjectColor = (type) => {
    switch (type) {
      case 'moodboard':
        return 'from-pink-500 to-purple-500';
      case 'mindmap':
        return 'from-blue-500 to-cyan-500';
      case 'canvas':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Cargando tus proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Tu Espacio Creativo
          </h1>
          <p className="text-white/60 text-lg">
            Gestiona y desarrolla tus proyectos creativos
          </p>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyectos..."
              className="w-full pl-10 pr-4 py-3 bg-[#16161a] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7]/30 transition-colors"
            />
          </div>
        </motion.div>
      </div>

      {/* Create New Project Buttons */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-4 flex-wrap"
        >
          {['moodboard', 'mindmap', 'canvas'].map((type, index) => (
            <button
              key={type}
              onClick={() => handleCreateProject(type)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white rounded-xl hover:from-[#9333ea] hover:to-[#7c3aed] transition-all transform hover:scale-105"
            >
              {getProjectIcon(type)}
              <span className="font-medium capitalize">
                Nuevo {type === 'moodboard' ? 'Moodboard' : type === 'mindmap' ? 'Mindmap' : 'Canvas'}
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-[#16161a] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-[#a855f7]" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
            </h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Intenta con otra búsqueda o crea un nuevo proyecto' 
                : 'Comienza tu viaje creativo creando tu primer proyecto'
              }
            </p>
            {!searchTerm && (
              <div className="flex gap-4 justify-center">
                {['moodboard', 'mindmap', 'canvas'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleCreateProject(type)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#16161a] border border-white/[0.08] rounded-lg hover:bg-white/[0.10] transition-colors"
                  >
                    {getProjectIcon(type)}
                    <span className="text-sm capitalize">{type}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="bg-[#16161a] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] transition-all group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getProjectColor(project.tipo)} rounded-lg flex items-center justify-center`}>
                      {getProjectIcon(project.tipo)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{project.nombre}</h3>
                      <p className="text-white/60 text-sm capitalize">{project.tipo}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Project Description */}
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {project.descripcion || 'Sin descripción'}
                </p>

                {/* Project Stats */}
                <div className="flex items-center justify-between text-white/40 text-xs mb-4">
                  <span>Creado: {new Date(project.created_at).toLocaleDateString()}</span>
                  <span>Actualizado: {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>

                {/* Open Button */}
                <a
                  href={`/${project.tipo}/${project.id}`}
                  className="block w-full py-2 bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white text-center rounded-lg hover:from-[#9333ea] hover:to-[#7c3aed] transition-all"
                >
                  Abrir Proyecto
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#16161a] border border-white/[0.08] rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              Eliminar Proyecto
            </h3>
            <p className="text-white/60 mb-6">
              ¿Estás seguro de que quieres eliminar "{projectToDelete.nombre}"? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2 bg-white/[0.10] text-white rounded-lg hover:bg-white/[0.20] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProject(projectToDelete.id)}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
