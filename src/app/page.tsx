"use client";

import ChatContainer from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24 text-neutral-900">
      <div className="space-y-32">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Acompanante creativo
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            No es para inspirarte.
            <br />
            Es para que empieces.
          </h1>
          <p className="max-w-xl text-base text-neutral-700 sm:text-lg">
            Un espacio para destrabar ideas, paso a paso, sin presion.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#chat"
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Empezar ahora
            </a>
          </div>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Que hace
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>Te escucha primero.</li>
              <li>Te ayuda a encontrar el bloqueo.</li>
              <li>Te guia con ejercicios simples.</li>
              <li>Te deja parar cuando quieras.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Para quien es
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>Personas creativas bloqueadas.</li>
              <li>Personas con demasiadas ideas.</li>
              <li>Personas cansadas de forzarse.</li>
              <li>Personas que quieren empezar, no impresionar.</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Privacidad
            </h2>
            <p className="text-sm text-neutral-700">
              Todo ocurre en tu navegador. No guardamos nada en nuestros
              servidores.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Listo cuando tu quieras
            </h2>
            <p className="text-sm text-neutral-700">
              Si hoy no sale, aqui puedes volver cuando lo necesites.
            </p>
          </div>
        </section>

        <section id="chat" className="mx-auto w-full max-w-md">
          <ChatContainer />
        </section>

        <footer className="border-t border-neutral-200 pt-6 text-sm text-neutral-600">
          Vuelve cuando lo necesites.
        </footer>
      </div>
    </main>
  );
}
