import Link from "next/link";
import { Sparkles, Palette, MessageSquare, Layout, Lightbulb, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

import PWAInstallLink from "@/components/PWAInstallLink";

export default function HomePage() {
              {/* Free Template Section */}
              <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Prueba gratis una plantilla de ejemplo
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Descarga una plantilla de proyecto creativo y comienza a estructurar tus ideas en segundos.
                  </p>
                  <a
                    href="/plantilla-ejemplo.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold text-lg shadow-xl"
                  >
                    Descargar plantilla gratuita
                  </a>
                </div>
              </section>
        {/* Social Proof Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Creadores como tú ya lo usan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex flex-col items-center">
                <img src="/avatar1.png" alt="Testimonio 1" className="w-14 h-14 rounded-full mb-3" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">“Por fin puedo pasar de idea a proyecto sin perderme en el proceso.”</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">— Ana, Ilustradora</span>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex flex-col items-center">
                <img src="/avatar2.png" alt="Testimonio 2" className="w-14 h-14 rounded-full mb-3" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">“El coach de IA me ayuda a enfocarme y avanzar cada día.”</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">— Luis, Emprendedor</span>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex flex-col items-center">
                <img src="/avatar3.png" alt="Testimonio 3" className="w-14 h-14 rounded-full mb-3" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">“Moodboards y canvas en un solo lugar. ¡Ahorra tiempo real!”</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">— Sofía, Diseñadora UX</span>
              </div>
            </div>
          </div>
        </section>
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">CreationX</div>
                  <div className="text-sm text-white/80">Plataforma Creativa</div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Claridad creativa instantánea.<br />
              <span className="text-blue-200">Enfócate. Ejecuta. Sin bloqueos.</span>
            </h1>
            <p className="text-lg sm:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
              Lleva tus ideas a la acción con enfoque y claridad. Elimina el caos creativo y ejecuta proyectos sin fricción con Canvas, Moodboards y un Coach de IA.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup"
                className="group px-8 py-4 min-h-[44px] text-base sm:text-lg bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                <span className="mr-2">🚀</span> Empieza sin bloqueo
              </Link>
              <Link 
                href="#demo-video"
                className="px-8 py-4 min-h-[44px] text-base sm:text-lg border-2 border-white/30 text-white rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-semibold flex items-center justify-center"
              >
                <span className="mr-2">▶</span> Ver demo en 1 min
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Visual Section */}
      <section id="demo-video" className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mira cómo pasas de idea a acción en 1 minuto
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Así funciona CreationX: claridad, enfoque y ejecución creativa sin bloqueos.
          </p>
          <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video">
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
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Herramientas para claridad y acción
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Elimina el caos creativo. Visualiza, estructura y ejecuta tus ideas en minutos.
            </p>
          </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Layout className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Canvas: Visualiza y ejecuta
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Pasa de idea a acción en un lienzo infinito, sin bloqueos ni distracciones.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Palette className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Moodboards: Inspírate y decide
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Junta referencias y elige rápido. Sin perderte en la inspiración.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Mindmaps: Ordena y enfoca
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Estructura tus ideas en segundos. Enfócate en lo importante, sin ruido.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Coach IA: Sin bloqueos
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Recibe claridad y foco inmediato. Supera bloqueos y ejecuta con confianza.
                </p>
              </div>

              {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Gestión de Proyectos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organiza todos tus proyectos creativos en un solo lugar con seguimiento de progreso.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Memoria Persistente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tu progreso, preferencias y proyectos se guardan automáticamente en la nube.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona CreationX?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Empieza a crear en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Crea tu cuenta gratis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Regístrate en segundos y accede a todas las herramientas creativas sin costo inicial.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Elige tu herramienta
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Canvas para diseñar, Moodboard para inspirarte, Mindmap para planear o Chat para recibir coaching.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Crea sin límites
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trabaja en tus proyectos, guarda tu progreso y accede desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            ¿Listo para crear algo increíble?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Únete a CreationX y lleva tus proyectos creativos al siguiente nivel
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center px-10 py-5 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl"
          >
            Comenzar Ahora Gratis
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
          <div className="mt-6">
            <PWAInstallLink />
          </div>
        </div>
      </section>
    </div>
  );
}
