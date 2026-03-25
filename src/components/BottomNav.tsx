"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, Lightbulb, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Inicio',
      active: pathname === '/'
    },
    {
      href: '/start',
      icon: Plus,
      label: 'Crear',
      active: pathname === '/start'
    },
    {
      href: '/creative-coach',
      icon: Lightbulb,
      label: 'Ideas',
      active: pathname === '/creative-coach' || pathname?.startsWith('/creative-coach')
    },
    {
      href: '/profile',
      icon: User,
      label: 'Perfil',
      active: pathname === '/profile'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                item.active
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.active ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
