import ThemeToggle from "./ThemeToggle"

export default function TopHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/95 dark:bg-[#212121]/95 z-10">
      <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{title}</h1>
      <ThemeToggle />
    </header>
  )
}
