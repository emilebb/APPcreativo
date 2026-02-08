"use client"
import { 
  Plus, Search, Image as ImageIcon, LayoutGrid, Terminal, 
  FolderPlus, Folder, MessageSquare, UserCircle 
} from "lucide-react"

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-3 sidebar">
      {/* Botón Nuevo Chat */}
      <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors mb-4">
        <Plus size={18} />
        <span className="text-sm font-medium">Nuevo chat</span>
      </button>

      {/* Sección Herramientas */}
      <div className="space-y-1 mb-8">
        <NavItem icon={<Search size={18}/>} label="Buscar chats" />
        <NavItem icon={<ImageIcon size={18}/>} label="Imágenes" />
        <NavItem icon={<LayoutGrid size={18}/>} label="Aplicaciones" />
        <NavItem icon={<Terminal size={18}/>} label="Codex" />
      </div>

      {/* Sección Proyectos */}
      <div className="mb-8">
        <p className="px-3 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Proyectos</p>
        <NavItem icon={<FolderPlus size={18}/>} label="Nuevo proyecto" />
        <NavItem icon={<Folder size={18}/>} label="app" />
        <NavItem icon={<Folder size={18}/>} label="Tiktok" />
      </div>

      {/* Sección Chats Recientes */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Tus chats</p>
        <NavItem icon={<MessageSquare size={18}/>} label="App para bloqueo creativo" truncate />
      </div>

      {/* Perfil de Usuario (Abajo) */}
      <div className="pt-4 border-t dark:border-zinc-800 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
            EM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Emile</span>
            <span className="text-[10px] text-zinc-500">Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, truncate = false }: { icon: any, label: string, truncate?: boolean }) {
  return (
    <div className={`flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${truncate ? 'overflow-hidden' : ''}`}>
      <span className="text-zinc-600 dark:text-zinc-400">{icon}</span>
      <span className={`text-sm ${truncate ? 'truncate' : ''}`}>{label}</span>
    </div>
  )
}
