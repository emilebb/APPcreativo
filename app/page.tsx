"use client";

import { useState } from "react";
import ChatContainer from "@/components/chat/ChatContainer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn, User, Palette, Brain, Layers } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              CreationX
            </h1>
            <p className="text-lg text-gray-600">
              Tu espacio creativo profesional
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Bienvenido
              </h2>
              <p className="text-gray-600">
                Inicia sesión para acceder a tu espacio creativo
              </p>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </Link>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Palette className="w-4 h-4 text-blue-600" />
                </div>
                <span>Canvas Creativo</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Layers className="w-4 h-4 text-green-600" />
                </div>
                <span>Moodboards</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <span>Mapas Mentales</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>¿No tienes cuenta?{" "}
            <Link href="/login" className="text-blue-800 hover:text-blue-900 font-medium">
              Regístrate gratis
            </Link>
          </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full items-stretch px-4 py-4 text-neutral-900 sm:px-8 sm:py-8">
      <section id="chat" className="w-full">
        <ChatContainer />
      </section>
    </main>
  );
}
