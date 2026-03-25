"use client";

import Link from "next/link";
import { ArrowLeft, Home, Plus, Sparkles, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9333ea]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#9333ea]/5 rounded-full blur-[120px]" />
      </div>

      {/* 404 Content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[120px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              404
            </div>
            <div className="absolute -top-4 -right-4">
              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            ¡Ups! Proyecto no encontrado
          </h1>
          <p className="text-white/60 leading-relaxed">
            Parece que este proyecto ha sido eliminado o nunca existió. 
            Pero no te preocupes, ¡siempre puedes crear algo nuevo!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <Home className="w-4 h-4" />
              Ir al Dashboard
            </Link>
            
            <Link
              href="/canvas"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver Atrás
            </button>
            
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Search className="w-4 h-4" />
              Buscar Proyectos
            </Link>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="mt-12 p-4 bg-[#1c1c21]/50 backdrop-blur-sm border border-white/10 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-2">
            💡 ¿Qué puedes hacer?
          </h3>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Revisa si el enlace es correcto</li>
            <li>• El proyecto pudo haber sido eliminado</li>
            <li>• Crea un nuevo proyecto desde cero</li>
            <li>• Explora tus proyectos existentes</li>
          </ul>
        </div>

        {/* Brand */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-white/40 text-sm">
            CreacionX - Tu Plataforma Creativa
          </span>
        </div>
      </div>
    </div>
  );
}
