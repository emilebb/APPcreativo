"use client";

import { Bell, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function NotificationsSettings() {
  const [emailDigest, setEmailDigest] = useState("weekly");
  const [coachReminders, setCoachReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Notificaciones
        </h1>
        <p className="text-neutral-500 dark:text-[#9ca3af] text-sm mt-1">
          Decide cuándo y cómo quieres recibir avisos de CreationX.
        </p>
      </header>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-1">
              Resumen por email
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-3">
              Recibe un resumen de tu actividad y recordatorios.
            </p>
            <div className="relative">
              <select
                value={emailDigest}
                onChange={(e) => setEmailDigest(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-white dark:bg-white/95 text-neutral-900 dark:text-[#111827] rounded-xl border border-neutral-200 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="off">Desactivado</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
              <Bell className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-[#6b7280] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db]">
                Recordatorios del Coach
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#6b7280] mt-0.5">
                Avisos suaves para retomar conversaciones o proyectos.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={coachReminders}
            onClick={() => setCoachReminders(!coachReminders)}
            className={`
              relative w-11 h-6 rounded-full transition-colors flex-shrink-0
              ${coachReminders ? "bg-blue-500" : "bg-neutral-200 dark:bg-white/10"}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${coachReminders ? "left-6 translate-x-0" : "left-1"}
              `}
            />
          </button>
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db]">
              Actualizaciones de proyectos
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#6b7280] mt-0.5">
              Notificaciones cuando haya cambios en proyectos compartidos.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={projectUpdates}
            onClick={() => setProjectUpdates(!projectUpdates)}
            className={`
              relative w-11 h-6 rounded-full transition-colors flex-shrink-0
              ${projectUpdates ? "bg-blue-500" : "bg-neutral-200 dark:bg-white/10"}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${projectUpdates ? "left-6 translate-x-0" : "left-1"}
              `}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
