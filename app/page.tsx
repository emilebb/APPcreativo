import Link from "next/link";
import {
  Sparkles,
  Palette,
  MessageSquare,
  Layout,
  Lightbulb,
  Zap,
  ArrowRight,
  CheckCircle2,
  Download,
} from "lucide-react";

import PWAInstallLink from "@/components/PWAInstallLink";
import InstallButton from "@/components/InstallButton";

const testimonials = [
  {
    quote: "Por fin puedo pasar de idea a proyecto sin perderme en el proceso.",
    author: "Ana",
    role: "Ilustradora",
    initial: "A",
  },
  {
    quote: "El coach de IA me ayuda a enfocarme y avanzar cada día.",
    author: "Luis",
    role: "Emprendedor",
    initial: "L",
  },
  {
    quote: "Moodboards y canvas en un solo lugar. ¡Ahorra tiempo real!",
    author: "Sofía",
    role: "Diseñadora UX",
    initial: "S",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_100%)] opacity-90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Logo Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 shadow-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-white tracking-tight">CreativoX AI</div>
                  <div className="text-xs text-white/50">Coach Creativo Inteligente</div>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-violet-500/20 to-blue-500/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/10">
              Powered by IA
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Detecta tus bloqueos creativos
              </span>
              <br />
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/60">
                y genera ideas con IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/50 max-w-3xl mx-auto mb-12 leading-relaxed px-4">
              <strong className="text-white">Coach Creativo Inteligente</strong> que analiza tu situación, 
              detecta bloqueos y genera ideas, planes y contenido al instante.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center px-4 mb-10">
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all text-center"
              >
                Iniciar Sesión
              </Link>
            </div>
            
            {/* PWA Install */}
            <div className="flex justify-center">
              <InstallButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Herramientas para claridad y acción
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Elimina el caos creativo. Visualiza, estructura y ejecuta tus ideas en minutos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Layout,
                title: "Canvas: Visualiza y ejecuta",
                desc: "Pasa de idea a acción en un lienzo infinito, sin bloqueos ni distracciones.",
                color: "violet",
              },
              {
                icon: Palette,
                title: "Moodboards: Inspírate y decide",
                desc: "Junta referencias y elige rápido. Sin perderte en la inspiración.",
                color: "blue",
              },
              {
                icon: Lightbulb,
                title: "Mindmaps: Ordena y enfoca",
                desc: "Estructura tus ideas en segundos. Enfócate en lo importante.",
                color: "emerald",
              },
              {
                icon: MessageSquare,
                title: "Coach IA: Sin bloqueos",
                desc: "Recibe claridad y foco inmediato. Supera bloqueos y ejecuta con confianza.",
                color: "orange",
              },
              {
                icon: Zap,
                title: "Gestión de Proyectos",
                desc: "Organiza todos tus proyectos creativos en un solo lugar.",
                color: "pink",
              },
              {
                icon: CheckCircle2,
                title: "Memoria Persistente",
                desc: "Tu progreso y proyectos se guardan automáticamente.",
                color: "indigo",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm"
                  style={{
                    backgroundColor: `rgba(${color === "violet" ? "139, 92, 246" : color === "blue" ? "59, 130, 246" : color === "emerald" ? "16, 185, 129" : color === "orange" ? "249, 115, 22" : color === "pink" ? "236, 72, 153" : "99, 102, 241"}, 0.15)`,
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{
                      color: `rgb(${color === "violet" ? "139, 92, 246" : color === "blue" ? "59, 130, 246" : color === "emerald" ? "16, 185, 129" : color === "orange" ? "249, 115, 22" : color === "pink" ? "236, 72, 153" : "99, 102, 241"})`,
                    }}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                  {title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              ¿Cómo funciona CreationX?
            </h2>
            <p className="text-lg text-white/50">
              Empieza a crear en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
            {[
              {
                step: 1,
                title: "Accede directamente",
                desc: "Entra sin registro y accede a todas las herramientas creativas de inmediato.",
              },
              {
                step: 2,
                title: "Elige tu herramienta",
                desc: "Canvas para diseñar, Moodboard para inspirarte, Mindmap para planear o Chat para recibir coaching.",
              },
              {
                step: 3,
                title: "Crea sin límites",
                desc: "Trabaja en tus proyectos, guarda tu progreso y accede desde cualquier dispositivo.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-black shadow-lg shadow-violet-500/25">
                  {step}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-12">
            Creadores como tú ya lo usan
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role, initial }) => (
              <div
                key={author}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-5 text-violet-400 font-bold text-xl">
                  {initial}
                </div>
                <p className="text-white/80 mb-5 leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                <span className="text-sm text-white/40">
                  — {author}, {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/20 to-transparent rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5">
            ¿Listo para crear algo increíble?
          </h2>
          <p className="text-lg text-white/50 mb-10">
            Únete a CreationX y lleva tus proyectos creativos al siguiente nivel
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all"
          >
            Comenzar Ahora Gratis
            <ArrowRight className="ml-3 h-6 w-6" />
          </Link>
          <div className="mt-8">
            <PWAInstallLink />
          </div>
        </div>
      </section>
    </div>
  );
}
