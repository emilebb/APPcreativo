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
  Play,
} from "lucide-react";

import PWAInstallLink from "@/components/PWAInstallLink";

const testimonials = [
  {
    quote:
      "Por fin puedo pasar de idea a proyecto sin perderme en el proceso.",
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] dark:bg-[#0f0f10] dark:text-[var(--foreground)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10" aria-hidden />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/5 rounded-full blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl" aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" aria-hidden />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    CreationX
                  </div>
                  <div className="text-sm text-white/80">Plataforma Creativa</div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Claridad creativa instantánea.
              <br />
              <span className="text-white/90">Enfócate. Ejecuta. Sin bloqueos.</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Lleva tus ideas a la acción con enfoque y claridad. Elimina el
              caos creativo y ejecuta proyectos sin fricción con Canvas,
              Moodboards y un Coach de IA.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                className="group px-8 py-4 min-h-[48px] text-base sm:text-lg bg-white text-violet-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
              >
                <Sparkles className="w-5 h-5 mr-2 opacity-80" aria-hidden />
                Empieza sin bloqueo
              </Link>
              <Link
                href="#demo-video"
                className="px-8 py-4 min-h-[48px] text-base sm:text-lg border-2 border-white/40 text-white rounded-xl hover:bg-white/15 backdrop-blur-sm transition-all duration-200 font-semibold flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <Play className="w-5 h-5 mr-2 fill-current" aria-hidden />
                Ver demo en 1 min
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demo-video"
        className="scroll-mt-20 py-16 sm:py-20 bg-[var(--card)] dark:bg-[#18181b] border-b border-[var(--border-subtle,rgba(0,0,0,0.06))] dark:border-white/5"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--foreground)] mb-3">
            De idea a acción en 1 minuto
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-muted,#6b7280)] dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Así funciona CreationX: claridad, enfoque y ejecución creativa sin
            bloqueos.
          </p>
          <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
            <div className="aspect-video bg-black/5">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Demo CreationX"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-[var(--bg)] dark:bg-[#0f0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
              Herramientas para claridad y acción
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-muted,#6b7280)] dark:text-gray-400 max-w-2xl mx-auto">
              Elimina el caos creativo. Visualiza, estructura y ejecuta tus ideas
              en minutos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                desc: "Estructura tus ideas en segundos. Enfócate en lo importante, sin ruido.",
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
                desc: "Organiza todos tus proyectos creativos en un solo lugar con seguimiento de progreso.",
                color: "pink",
              },
              {
                icon: CheckCircle2,
                title: "Memoria Persistente",
                desc: "Tu progreso, preferencias y proyectos se guardan automáticamente en la nube.",
                color: "indigo",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-[var(--card)] dark:bg-[#18181b] rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/5 hover:ring-2 hover:ring-[var(--accent)]/20 dark:hover:ring-[var(--accent)]/30 transition-all duration-200"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={
                    {
                      backgroundColor:
                        color === "violet"
                          ? "rgba(139, 92, 246, 0.15)"
                          : color === "blue"
                            ? "rgba(59, 130, 246, 0.15)"
                            : color === "emerald"
                              ? "rgba(16, 185, 129, 0.15)"
                              : color === "orange"
                                ? "rgba(249, 115, 22, 0.15)"
                                : color === "pink"
                                  ? "rgba(236, 72, 153, 0.15)"
                                  : "rgba(99, 102, 241, 0.15)",
                    } as React.CSSProperties
                  }
                >
                  <Icon
                    className="w-7 h-7"
                    style={
                      {
                        color:
                          color === "violet"
                            ? "rgb(124, 58, 237)"
                            : color === "blue"
                              ? "rgb(37, 99, 235)"
                              : color === "emerald"
                                ? "rgb(5, 150, 105)"
                                : color === "orange"
                                  ? "rgb(234, 88, 12)"
                                  : color === "pink"
                                    ? "rgb(219, 39, 119)"
                                    : "rgb(79, 70, 229)",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-3">
                  {title}
                </h3>
                <p className="text-[var(--text-muted,#6b7280)] dark:text-gray-400 text-base leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-[var(--card)] dark:bg-[#18181b] border-y border-[var(--border-subtle,rgba(0,0,0,0.06))] dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
              ¿Cómo funciona CreationX?
            </h2>
            <p className="text-lg text-[var(--text-muted,#6b7280)] dark:text-gray-400">
              Empieza a crear en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            {[
              {
                step: 1,
                title: "Crea tu cuenta gratis",
                desc: "Regístrate en segundos y accede a todas las herramientas creativas sin costo inicial.",
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
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                  {step}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3">
                  {title}
                </h3>
                <p className="text-[var(--text-muted,#6b7280)] dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Template Section */}
      <section className="py-16 sm:py-20 bg-[var(--bg)] dark:bg-[#0f0f10]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
            Prueba gratis una plantilla de ejemplo
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-muted,#6b7280)] dark:text-gray-400 mb-8">
            Descarga una plantilla de proyecto creativo y comienza a estructurar
            tus ideas en segundos.
          </p>
          <a
            href="/plantilla-ejemplo.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl transition-all duration-200 font-bold text-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <Download className="w-5 h-5 mr-2" aria-hidden />
            Descargar plantilla gratuita
          </a>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 bg-[var(--card)] dark:bg-[#18181b] border-t border-[var(--border-subtle,rgba(0,0,0,0.06))] dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-10">
            Creadores como tú ya lo usan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, author, role, initial }) => (
              <div
                key={author}
                className="bg-[var(--bg)] dark:bg-[#0f0f10] rounded-2xl p-6 sm:p-8 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/5 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400 font-bold text-xl">
                  {initial}
                </div>
                <p className="text-[var(--foreground)] dark:text-gray-200 mb-4 leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                <span className="text-sm text-[var(--text-muted,#6b7280)] dark:text-gray-400">
                  — {author}, {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" aria-hidden />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/5 rounded-full blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl" aria-hidden />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5">
            ¿Listo para crear algo increíble?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10">
            Únete a CreationX y lleva tus proyectos creativos al siguiente nivel
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-10 py-5 bg-white text-violet-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
          >
            Comenzar Ahora Gratis
            <ArrowRight className="ml-2 h-6 w-6" aria-hidden />
          </Link>
          <div className="mt-8">
            <PWAInstallLink />
          </div>
        </div>
      </section>
    </div>
  );
}