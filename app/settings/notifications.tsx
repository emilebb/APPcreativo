"use client";

import { Bell, Mail, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/lib/useProfile";
import type { EmailDigestFrequency, NotificationPreferences } from "@/types/profile";

export default function NotificationsSettings() {
  const { profile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");

  // Cargar preferencias del perfil
  const emailDigest = profile?.notifications?.email_digest ?? "weekly";
  const coachReminders = profile?.notifications?.coach_reminders ?? true;
  const projectUpdates = profile?.notifications?.project_updates ?? true;
  const browserNotifications = profile?.notifications?.browser_notifications ?? false;

  // Verificar permisos de notificaciones del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Actualizar preferencia de notificaciones
  const updateNotificationPref = async (updates: Partial<NotificationPreferences>) => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        notifications: {
          email_digest: emailDigest,
          coach_reminders: coachReminders,
          project_updates: projectUpdates,
          browser_notifications: browserNotifications,
          ...updates
        }
      });
    } finally {
      setSaving(false);
    }
  };

  // Solicitar permisos de notificaciones del navegador
  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        await updateNotificationPref({ browser_notifications: true });
        
        // Mostrar notificación de prueba
        new Notification('¡Notificaciones activadas!', {
          body: 'Recibirás recordatorios del Coach cuando sea necesario.',
          icon: '/icon.svg'
        });
      } else {
        await updateNotificationPref({ browser_notifications: false });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

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
                onChange={(e) => updateNotificationPref({ email_digest: e.target.value as EmailDigestFrequency })}
                disabled={saving}
                className="w-full appearance-none px-4 py-3 bg-white dark:bg-white/95 text-neutral-900 dark:text-[#111827] rounded-xl border border-neutral-200 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
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
            onClick={() => updateNotificationPref({ coach_reminders: !coachReminders })}
            disabled={saving}
            className={`
              relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50
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
            onClick={() => updateNotificationPref({ project_updates: !projectUpdates })}
            disabled={saving}
            className={`
              relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50
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

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db]">
                Notificaciones del navegador
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#6b7280] mt-0.5">
                Recibe alertas en tu escritorio incluso cuando no estés en la app.
              </p>
              {browserPermission === 'denied' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  ⚠️ Permisos denegados. Habilítalos en la configuración de tu navegador.
                </p>
              )}
              {browserPermission === 'granted' && browserNotifications && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ Notificaciones activadas
                </p>
              )}
            </div>
          </div>
          {browserPermission === 'default' ? (
            <button
              onClick={requestBrowserPermission}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Activar
            </button>
          ) : (
            <button
              type="button"
              role="switch"
              aria-checked={browserNotifications && browserPermission === 'granted'}
              onClick={() => {
                if (browserPermission === 'granted') {
                  updateNotificationPref({ browser_notifications: !browserNotifications });
                } else {
                  requestBrowserPermission();
                }
              }}
              disabled={saving || browserPermission === 'denied'}
              className={`
                relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50
                ${browserNotifications && browserPermission === 'granted' ? "bg-blue-500" : "bg-neutral-200 dark:bg-white/10"}
              `}
            >
              <span
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                  ${browserNotifications && browserPermission === 'granted' ? "left-6 translate-x-0" : "left-1"}
                `}
              />
            </button>
          )}
        </div>
      </section>

      {saving && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            Guardando preferencias...
          </p>
        </div>
      )}
    </div>
  );
}
