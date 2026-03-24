'use client';

import CanvasBoard from '@/components/canvas/CanvasBoard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CanvasPage() {
  return (
    <div className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </Link>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Pizarra
            </h1>
          </div>
          
          <div className="text-sm text-neutral-500">
            V=Select | P=Lápiz | R=Rect | O=Círculo | T=Texto
          </div>
        </div>
      </header>
      
      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <CanvasBoard />
      </div>
    </div>
  );
}
