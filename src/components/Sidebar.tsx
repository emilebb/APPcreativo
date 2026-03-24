"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { 
  Home, 
  Search, 
  MessageCircle,
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
            setProjects([])
          }
        }
      }
    }

    loadProjects()
    return () => { mounted = false }
  }, [user])

  const handleCreateProject = async (type: 'canvas' | 'moodboard' | 'mindmap') => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    
    if (!user) {
      creatingRef.current = false;
      return
    }

    setLoading(true)
    try {
      const project = await projectService.createProject(user.id, type)
      
      const routes = {
        canvas: `/canvas`,
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
    ...(user ? [] : [{ name: 'Inicio', href: '/', icon: Home }]),
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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 backdrop-blur-xl bg-white/10 border border-white/10 rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-11/12 max-w-[280px]
        backdrop-blur-xl bg-black/40 border-r border-white/10
        transform transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-black text-white tracking-tight">CreationX</div>
                <div className="text-xs text-white/40">Plataforma Creativa</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-white border border-violet-500/30' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
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

          {/* Create Button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => handleCreateProject('canvas')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </button>
          </div>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                Proyectos Recientes
              </h3>
              <div className="space-y-1">
                {projects.slice(0, 5).map((project) => {
                  const projectRoutes = {
                    canvas: '/canvas',
                    moodboard: `/moodboard/${project.id}`,
                    mindmap: `/mindmap/${project.id}`
                  };
                  const href = projectRoutes[project.type as keyof typeof projectRoutes] || '/';
                  
                  return (
                    <Link
                      key={project.id}
                      href={href}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="truncate">{project.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
