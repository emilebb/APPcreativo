"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Plus, Search, Image as ImageIcon, GitGraph, PencilRuler, 
  FolderPlus, Folder, MessageSquare, UserCircle, Settings,
  Menu, X, Home
} from "lucide-react"
import { useAuth } from "@/lib/authProvider"
import { projectService, type Project } from "@/lib/projectService"

export default function Sidebar({ user }: { user: any | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const userProjects = await projectService.getProjects(user.id)
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (type: Project['type'] = 'canvas') => {
    console.log('handleCreateProject called', { type, userId: user?.id });
    
    if (!user?.id) {
      console.log('No user found, redirecting to auth');
      router.push('/auth');
      return;
    }

    try {
      console.log('Creating project with type:', type);
      const newProject = await projectService.createProject(user.id, type);
      console.log('Project created successfully:', newProject);
      
      setIsMobileMenuOpen(false);
      
      // Redirect based on project type
      const redirectPath = type === 'moodboard' ? `/moodboard/${newProject.id}` :
                        type === 'mindmap' ? `/mindmap/${newProject.id}` :
                        type === 'canvas' ? `/canvas/${newProject.id}` :
                        `/project/${newProject.id}`;
      
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
      
      // Refresh projects list after creation
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error al crear proyecto. Intenta nuevamente.');
    }
  }

  const navigationItems = [
    { href: "/", icon: <Home size={18} />, label: "Inicio", mobileOnly: false },
    { href: "/search", icon: <Search size={18} />, label: "Buscar", mobileOnly: false },
    { href: "/moodboard", icon: <ImageIcon size={18} />, label: "Moodboards", mobileOnly: false },
    { href: "/mindmap", icon: <GitGraph size={18} />, label: "Mapas Mentales", mobileOnly: false },
    { href: "/canvas", icon: <PencilRuler size={18} />, label: "Pizarra", mobileOnly: false },
    { href: "/project/app", icon: <Folder size={18} />, label: "App RBR", mobileOnly: true },
    { href: "/project/tiktok", icon: <Folder size={18} />, label: "TikTok", mobileOnly: true },
    { href: "/chat/bloqueo", icon: <MessageSquare size={18} />, label: "Creative Coach", mobileOnly: true },
  ]

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${isMobile ? 'p-4' : 'p-3'} bg-[#f9f9f9] dark:bg-[#171717]`}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      )}

      {/* Botón Nuevo Proyecto */}
      <button 
        onClick={() => {
          console.log('Button clicked!');
          handleCreateProject();
        }}
        className={`flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800 border dark:border-zinc-700 hover:shadow-sm transition-all ${isMobile ? 'mb-6' : 'mb-6'}`}
      >
        <Plus size={18} className="text-zinc-500" />
        <span className="text-sm font-semibold">Nuevo Proyecto</span>
      </button>

      {/* Navegación Principal */}
      <div className={`space-y-1 ${isMobile ? 'mb-6' : 'mb-8'}`}>
        {navigationItems.filter(item => !item.mobileOnly || isMobile).map((item) => (
          <SidebarItem 
            key={item.href}
            href={item.href} 
            icon={item.icon} 
            label={item.label} 
            active={pathname === item.href || (item.href !== '/' && pathname.includes(item.href))}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          />
        ))}
      </div>

      {/* Proyectos Recientes - Solo en desktop */}
      {!isMobile && (
        <div className="flex-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
            {loading ? 'Cargando...' : 'Tus Proyectos'}
          </p>
          {projects.length === 0 && !loading ? (
            <p className="px-3 text-sm text-zinc-400">No hay proyectos aún</p>
          ) : (
            projects.map((project) => (
              <SidebarItem 
                key={project.id}
                href={`/${project.type === 'canvas' ? 'canvas' : project.type}/${project.id}`} 
                icon={<Folder size={18}/>} 
                label={project.title} 
                truncate 
              />
            ))
          )}
        </div>
      )}

      {/* Perfil de Usuario */}
      <div className={`pt-4 border-t dark:border-zinc-800 mt-auto flex items-center gap-2 ${isMobile ? 'px-0' : 'px-3'}`}>
        <Link 
          href="/settings" 
          className="flex items-center gap-3 flex-1 p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-base font-bold text-white shadow-inner">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          {!isMobile && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold truncate">
                {user?.email ? user.email.split('@')[0] : 'Usuario'}
              </span>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">PLUS</span>
              {user?.email && (
                <span className="text-[10px] text-zinc-400 truncate">{user.email}</span>
              )}
            </div>
          )}
        </Link>
        <Link 
          href="/settings" 
          className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          <Settings size={22} className="text-zinc-400" />
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border dark:border-zinc-700 hover:shadow-sm transition-all"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] h-full flex-col border-r dark:border-zinc-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-72 h-full bg-[#f9f9f9] dark:bg-[#171717] shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  )
}

function SidebarItem({ href, icon, label, active = false, truncate = false, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
        active 
          ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' 
          : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={`text-sm font-medium ${truncate ? 'truncate' : ''}`}>{label}</span>
    </Link>
  )
}
