"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { Palette, Brain, Layers, Users, Zap, Shield, Globe } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth || auth.loading) return;

    if (auth.user) {
      router.replace("/explore");
    } else {
      router.replace("/login");
    }
  }, [auth, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CreationX
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tu plataforma creativa profesional para gestionar proyectos, ideas y colaboración en tiempo real
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.replace("/login")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Comenzar Ahora
            </button>
            <button
              onClick={() => window.open("https://github.com/emilebb/APPcreativo", "_blank")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Ver Código
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Canvas Creativo */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Canvas Creativo</h3>
            <p className="text-gray-600 mb-4">
              Espacio de dibujo libre con herramientas profesionales, capas y efectos visuales para dar vida a tus ideas.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Herramientas de diseño avanzadas</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Sistema de capas profesional</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Exportación en múltiples formatos</span>
              </li>
            </ul>
          </div>

          {/* Mind Maps */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mind Maps</h3>
            <p className="text-gray-600 mb-4">
              Organiza tus ideas visualmente con nodos interconectados, jerarquías claras y estructuras flexibles.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>Nodos y conexiones inteligentes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>Jerarquía visual de ideas</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>Importación/exportación de estructuras</span>
              </li>
            </ul>
          </div>

          {/* Mood Boards */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mood Boards</h3>
            <p className="text-gray-600 mb-4">
              Crea tableros de inspiración visual con arrastrar y soltar, paletas de colores y referencias organizadas.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>Grid de inspiración visual</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>Arrastrar y soltar imágenes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>Paletas de colores automáticas</span>
              </li>
            </ul>
          </div>

          {/* Colaboración */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Colaboración Real</h3>
            <p className="text-gray-600 mb-4">
              Trabaja en equipo con chat integrado, comentarios en tiempo real y sincronización automática de cambios.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>Chat en tiempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>Comentarios y anotaciones</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>Historial de versiones</span>
              </li>
            </ul>
          </div>

          {/* Seguridad */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Seguridad Total</h3>
            <p className="text-gray-600 mb-4">
              Tus datos protegidos con autenticación segura, encriptación de extremo a extremo y control de permisos granular.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Autenticación con Supabase</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Encriptación HTTPS</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Control de acceso por proyecto</span>
              </li>
            </ul>
          </div>

          {/* Rendimiento */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Rendimiento Ultra</h3>
            <p className="text-gray-600 mb-4">
              Optimizado para velocidad con carga lazy, cache inteligente y renderizado híbrido SSR/CSR para la mejor experiencia.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>Carga bajo demanda</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>Cache persistente</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>Renderizado optimizado</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">¿Cómo Funciona?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta gratuita en segundos con email y contraseña. Acceso inmediato a todas las herramientas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Crea</h3>
              <p className="text-gray-600">
                Elige tu tipo de proyecto (Canvas, Mindmap o Moodboard) y empieza a crear instantáneamente.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Colabora</h3>
              <p className="text-gray-600">
                Comparte proyectos, trabaja en equipo, chatea en tiempo real y lleva tus ideas al siguiente nivel.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para Empezar?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de creativos que ya usan CreationX para organizar sus ideas y colaborar en proyectos increíbles.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.replace("/login")}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Comenzar Gratis
            </button>
            <button
              onClick={() => window.open("https://github.com/emilebb/APPcreativo", "_blank")}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              Explorar Código
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
