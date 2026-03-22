// Sistema de notificaciones inteligentes basado en comportamiento

export interface SmartNotification {
  id: string;
  type: 'motivation' | 'reminder' | 'achievement' | 'tip' | 'block_detection';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  read: boolean;
}

export interface NotificationTrigger {
  condition: string;
  notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>;
}

// Triggers de notificaciones basados en comportamiento
export const NOTIFICATION_TRIGGERS: NotificationTrigger[] = [
  // Racha en peligro
  {
    condition: 'streak_at_risk',
    notification: {
      type: 'reminder',
      title: '🔥 ¡Tu racha está en peligro!',
      message: 'No has creado nada hoy. Mantén tu racha activa con solo 5 minutos de trabajo.',
      action: {
        label: 'Crear ahora',
        url: '/canvas'
      },
      priority: 'high'
    }
  },
  
  // Logro desbloqueado
  {
    condition: 'achievement_unlocked',
    notification: {
      type: 'achievement',
      title: '🎉 ¡Nuevo logro desbloqueado!',
      message: 'Has alcanzado un nuevo hito en tu viaje creativo.',
      action: {
        label: 'Ver logros',
        url: '/progress'
      },
      priority: 'high'
    }
  },
  
  // Nivel subido
  {
    condition: 'level_up',
    notification: {
      type: 'achievement',
      title: '⬆️ ¡Subiste de nivel!',
      message: 'Ahora eres nivel {level}. Sigue así para desbloquear más recompensas.',
      action: {
        label: 'Ver progreso',
        url: '/progress'
      },
      priority: 'high'
    }
  },
  
  // Bloqueo detectado
  {
    condition: 'creative_block_detected',
    notification: {
      type: 'block_detection',
      title: '🧠 Bloqueo creativo detectado',
      message: 'Parece que estás atorado. ¿Quieres que el Coach te ayude?',
      action: {
        label: 'Hablar con Coach',
        url: '/chat/bloqueo'
      },
      priority: 'high'
    }
  },
  
  // Inactividad prolongada
  {
    condition: 'inactive_3_days',
    notification: {
      type: 'reminder',
      title: '👋 Te extrañamos',
      message: 'Han pasado 3 días desde tu última sesión. ¿Listo para crear algo increíble?',
      action: {
        label: 'Volver a crear',
        url: '/explore'
      },
      priority: 'medium'
    }
  },
  
  // Proyecto sin terminar
  {
    condition: 'unfinished_project',
    notification: {
      type: 'reminder',
      title: '📋 Proyecto pendiente',
      message: 'Tienes un proyecto sin terminar. ¿Quieres continuarlo?',
      action: {
        label: 'Continuar proyecto',
        url: '/projects'
      },
      priority: 'medium'
    }
  },
  
  // Momento productivo
  {
    condition: 'productive_streak',
    notification: {
      type: 'motivation',
      title: '🚀 ¡Estás en racha!',
      message: 'Has completado 3 sesiones seguidas. Aprovecha este momentum.',
      priority: 'low'
    }
  },
  
  // Tip diario
  {
    condition: 'daily_tip',
    notification: {
      type: 'tip',
      title: '💡 Tip del día',
      message: 'Usa el Modo Enfoque para sesiones de 25 minutos sin distracciones.',
      action: {
        label: 'Probar ahora',
        url: '/canvas?focus=true'
      },
      priority: 'low'
    }
  },
  
  // Recordatorio de break
  {
    condition: 'long_session',
    notification: {
      type: 'reminder',
      title: '☕ Hora de un break',
      message: 'Llevas más de 1 hora trabajando. Toma 5 minutos de descanso.',
      priority: 'medium'
    }
  },
  
  // Sugerencia de herramienta
  {
    condition: 'suggest_tool',
    notification: {
      type: 'tip',
      title: '🛠️ Prueba algo nuevo',
      message: 'Aún no has usado el Mindmap. Es perfecto para organizar ideas complejas.',
      action: {
        label: 'Crear Mindmap',
        url: '/mindmap/new'
      },
      priority: 'low'
    }
  }
];

// Función para crear notificación
export function createNotification(
  trigger: NotificationTrigger,
  customData?: Record<string, any>
): SmartNotification {
  let message = trigger.notification.message;
  
  // Reemplazar placeholders
  if (customData) {
    Object.keys(customData).forEach(key => {
      message = message.replace(`{${key}}`, customData[key]);
    });
  }
  
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...trigger.notification,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
}

// Función para verificar condiciones y generar notificaciones
export function checkNotificationConditions(userData: {
  lastActiveDate: string;
  streak: number;
  level: number;
  stats: any;
  currentSessionTime: number;
  unfinishedProjects: number;
  toolsUsed: string[];
}): SmartNotification[] {
  const notifications: SmartNotification[] = [];
  const now = new Date();
  const lastActive = new Date(userData.lastActiveDate);
  const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  const daysSinceActive = Math.floor(hoursSinceActive / 24);
  
  // Racha en peligro (más de 20 horas sin actividad)
  if (userData.streak > 0 && hoursSinceActive > 20 && hoursSinceActive < 24) {
    const trigger = NOTIFICATION_TRIGGERS.find(t => t.condition === 'streak_at_risk');
    if (trigger) notifications.push(createNotification(trigger));
  }
  
  // Inactividad de 3 días
  if (daysSinceActive >= 3) {
    const trigger = NOTIFICATION_TRIGGERS.find(t => t.condition === 'inactive_3_days');
    if (trigger) notifications.push(createNotification(trigger));
  }
  
  // Proyecto sin terminar (más de 1 proyecto incompleto)
  if (userData.unfinishedProjects > 0) {
    const trigger = NOTIFICATION_TRIGGERS.find(t => t.condition === 'unfinished_project');
    if (trigger) notifications.push(createNotification(trigger));
  }
  
  // Sesión larga (más de 60 minutos)
  if (userData.currentSessionTime > 60) {
    const trigger = NOTIFICATION_TRIGGERS.find(t => t.condition === 'long_session');
    if (trigger) notifications.push(createNotification(trigger));
  }
  
  // Sugerir herramienta no usada
  const allTools = ['canvas', 'moodboard', 'mindmap', 'chat'];
  const unusedTools = allTools.filter(tool => !userData.toolsUsed.includes(tool));
  if (unusedTools.length > 0) {
    const trigger = NOTIFICATION_TRIGGERS.find(t => t.condition === 'suggest_tool');
    if (trigger) {
      const customMessage = trigger.notification.message.replace(
        'Mindmap',
        unusedTools[0].charAt(0).toUpperCase() + unusedTools[0].slice(1)
      );
      notifications.push({
        ...createNotification(trigger),
        message: customMessage
      });
    }
  }
  
  return notifications;
}

// Función para solicitar permisos de notificación del navegador
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Función para mostrar notificación del navegador
export function showBrowserNotification(notification: SmartNotification) {
  if (Notification.permission === 'granted') {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon.svg',
      badge: '/badge.svg',
      tag: notification.id,
      requireInteraction: notification.priority === 'high',
    });
    
    if (notification.action) {
      browserNotif.onclick = () => {
        window.focus();
        window.location.href = notification.action!.url;
        browserNotif.close();
      };
    }
  }
}

// Tips creativos rotativos
export const CREATIVE_TIPS = [
  '💡 Usa el Modo Enfoque para sesiones de 25 minutos sin distracciones.',
  '🎨 Crea un Moodboard antes de empezar para clarificar tu visión.',
  '🧠 Si estás bloqueado, habla con el Coach IA. Está entrenado para ayudarte.',
  '⚡ Hecho es mejor que perfecto. Puedes iterar después.',
  '📋 Divide proyectos grandes en tareas de 15 minutos.',
  '🎯 Define "terminado" antes de empezar para evitar perfeccionismo.',
  '🔥 Mantén tu racha activa creando al menos 5 minutos al día.',
  '🌟 Comparte tu trabajo aunque no esté perfecto. El feedback ayuda.',
  '🛠️ Experimenta con todas las herramientas para encontrar tu favorita.',
  '☕ Toma breaks cada hora para mantener la creatividad fresca.',
];

// Función para obtener tip aleatorio
export function getRandomTip(): string {
  return CREATIVE_TIPS[Math.floor(Math.random() * CREATIVE_TIPS.length)];
}

// Función para guardar notificaciones en localStorage
export function saveNotifications(notifications: SmartNotification[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('smart_notifications', JSON.stringify(notifications));
  }
}

// Función para cargar notificaciones desde localStorage
export function loadNotifications(): SmartNotification[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('smart_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }
  return [];
}

// Función para marcar notificación como leída
export function markAsRead(notificationId: string) {
  const notifications = loadNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Función para limpiar notificaciones antiguas (más de 7 días)
export function cleanOldNotifications() {
  const notifications = loadNotifications();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const filtered = notifications.filter(n => 
    new Date(n.timestamp) > sevenDaysAgo
  );
  
  saveNotifications(filtered);
}
