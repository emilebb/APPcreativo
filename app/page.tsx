"use client";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CreationX</h1>
        <p className="text-xl text-gray-600 mb-8">Tu plataforma creativa profesional</p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Comenzar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
