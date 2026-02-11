"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { 
  Home, 
  Search, 
  MessageCircle,  // Icono de chat
  Plus, 
  Settings, 
  Palette, 
  Brain, 
  Layers, 
  Sparkles,
  Folder,
  X,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { projectService, type Project } from "@/lib/projectService";

export default function Sidebar() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const creatingRef = useRef(false)

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      if (user && mounted) {
        try {
          const userProjects = await projectService.getProjects(user.id)
          if (mounted) {
            setProjects(userProjects)
          }
        } catch (error) {
          console.error('Error loading projects:', error)
          if (mounted) {
            setProjects([]) // Always set projects even on error
          }
        }
      }
    }

    loadProjects()
    return () => { mounted = false }
  }, [user])

  const handleCreateProject = async (type: 'canvas' | 'moodboard' | 'mindmap') => {
    // Guard against double creation
    if (creatingRef.current) return;
    creatingRef.current = true;
    
    if (!user) {
      alert('Por favor inicia sesión para crear proyectos')
      creatingRef.current = false;
      return
    }

    setLoading(true)
    try {
      console.log('Creating project with type:', type, 'for userId:', user.id)
      
      const project = await projectService.createProject(user.id, type)
      
      console.log('Project created successfully:', project)
      
      const routes = {
        canvas: `/canvas/${project.id}`,
        moodboard: `/moodboard/${project.id}`,
        mindmap: `/mindmap/${project.id}`
      }
      
      router.push(routes[type])
    } catch (error) {
      console.error('Error creating project:', error)
      alert('No se pudo crear el proyecto: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
      creatingRef.current = false;
    }
  }

  const navigation = [
    ...(user ? [] : [{ name: 'Inicio', href: '/', icon: Home }]), // Mostrar "Inicio" solo si no hay usuario
    { name: 'Explorar', href: '/explore', icon: Search },
    { name: 'Canvas', href: '/canvas', icon: Palette },
    { name: 'Moodboard', href: '/moodboard', icon: Layers },
    { name: 'Mindmap', href: '/mindmap', icon: Brain },
    { name: 'Creative Coach', href: '/chat/bloqueo', icon: MessageCircle },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ]

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-11/12 max-w-xs sm:w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700
        transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-neutral-900 dark:text-white">CreationX</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Plataforma Creativa</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-2 sm:p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-base sm:text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-2 sm:p-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => handleCreateProject('canvas')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </button>
          </div>

          {projects.length > 0 && (
            <div className="p-2 sm:p-4 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Proyectos Recientes
              </h3>
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/canvas/${project.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="truncate">{project.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
