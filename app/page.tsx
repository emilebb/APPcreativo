import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">CreationX</h1>
        <p className="text-xl text-gray-600 mb-8">
          Tu plataforma creativa profesional para gestionar proyectos, ideas y colaboración en tiempo real
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/signup"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
