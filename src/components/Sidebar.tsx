"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Plus, Search, Image as ImageIcon, GitGraph, PencilRuler, 
  FolderPlus, Folder, MessageSquare, UserCircle, Settings 
} from "lucide-react"

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full p-3 bg-[#f9f9f9] dark:bg-[#171717]">
      {/* Botón Acción Principal */}
      <Link href="/projects/new" className="flex items-center gap-3 w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border dark:border-zinc-700 hover:shadow-sm transition-all mb-6">
        <Plus size={18} className="text-zinc-500" />
        <span className="text-sm font-semibold">Nuevo Proyecto</span>
      </Link>

      {/* Herramientas Creativas */}
      <div className="space-y-1 mb-8">
        <SidebarItem 
          href="/search" icon={<Search size={18}/>} 
          label="Buscar Inspiración" active={pathname === '/search'} 
        />
        <SidebarItem 
          href="/moodboard" icon={<ImageIcon size={18}/>} 
          label="Moodboards" active={pathname.includes('/moodboard')} 
        />
        <SidebarItem 
          href="/mindmap" icon={<GitGraph size={18}/>} 
          label="Mapas Mentales" active={pathname.includes('/mindmap')} 
        />
        <SidebarItem 
          href="/canvas" icon={<PencilRuler size={18}/>} 
          label="Pizarra Libre" active={pathname.includes('/canvas')} 
        />
      </div>

      {/* Proyectos Recientes (Dinámicos) */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Tus Proyectos</p>
        <SidebarItem href="/project/app" icon={<Folder size={18}/>} label="App RBR" />
        <SidebarItem href="/project/tiktok" icon={<Folder size={18}/>} label="Contenido TikTok" />
        <SidebarItem href="/chat/bloqueo" icon={<MessageSquare size={18}/>} label="Creative Coach v1" truncate />
      </div>

      {/* Perfil de Usuario (Abajo) */}
      <Link href="/settings" className="pt-4 border-t dark:border-zinc-800 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">Plus</span>
          </div>
          <Settings size={14} className="ml-auto text-zinc-400" />
        </div>
      </Link>
    </div>
  )
}

function SidebarItem({ href, icon, label, active = false, truncate = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-all ${
        active 
          ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' 
          : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
      }`}
    >
      <span>{icon}</span>
      <span className={`text-sm font-medium ${truncate ? 'truncate' : ''}`}>{label}</span>
    </Link>
  )
}
