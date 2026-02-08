export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f9f9f9] dark:bg-[#171717] overflow-hidden">
      {/* Sidebar Fijo */}
      <aside className="w-64 flex-shrink-0 hidden md:block">
        {/* Sidebar espera recibir el usuario por props o contexto */}
      </aside>

      {/* App Content con efecto de tarjeta redondeada */}
      <main className="flex-1 m-2 ml-0 bg-white dark:bg-[#212121] rounded-2xl border dark:border-zinc-800 shadow-sm overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
